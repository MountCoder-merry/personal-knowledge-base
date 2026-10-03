use serde::Serialize;
use std::{
    fs,
    io::Write,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Vault {
    id: String,
    name: String,
    root_path: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct FileTreeNode {
    id: String,
    name: String,
    kind: String,
    path: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    children: Option<Vec<FileTreeNode>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VaultSnapshot {
    vault: Vault,
    tree: Vec<FileTreeNode>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RawNote {
    path: String,
    content: String,
    created_at: String,
    updated_at: String,
}

fn safe_relative(root: &Path, relative: &str) -> Result<PathBuf, String> {
    let candidate = Path::new(relative);
    if candidate.is_absolute()
        || relative.contains('\0')
        || candidate
            .components()
            .any(|component| matches!(component, std::path::Component::ParentDir))
    {
        return Err("Path must be relative to the Vault".into());
    }
    let joined = root.join(candidate);
    let normalized = joined.canonicalize().unwrap_or(joined.clone());
    if !normalized.starts_with(root) {
        return Err("Path escapes the Vault".into());
    }
    Ok(joined)
}

fn iso_time(path: &Path) -> String {
    path.metadata()
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
        .map(|d| format!("{}", d.as_secs()))
        .unwrap_or_else(|| "0".into())
}

fn node_for(root: &Path, path: &Path) -> Result<FileTreeNode, String> {
    let relative = path
        .strip_prefix(root)
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .replace('\\', "/");
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    if path.is_dir() {
        let mut children = Vec::new();
        let mut entries: Vec<_> = fs::read_dir(path)
            .map_err(|e| e.to_string())?
            .filter_map(Result::ok)
            .collect();
        entries.sort_by_key(|e| e.file_name());
        for entry in entries {
            let child_name = entry.file_name().to_string_lossy().to_string();
            if child_name.starts_with('.') || is_symlink(&entry.path()) {
                continue;
            }
            children.push(node_for(root, &entry.path())?);
        }
        Ok(FileTreeNode {
            id: relative.clone(),
            name,
            kind: "folder".into(),
            path: relative,
            children: Some(children),
        })
    } else {
        let kind = if path
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.eq_ignore_ascii_case("md"))
            .unwrap_or(false)
        {
            "note"
        } else {
            "asset"
        };
        Ok(FileTreeNode {
            id: relative.clone(),
            name,
            kind: kind.into(),
            path: relative,
            children: None,
        })
    }
}

fn is_symlink(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .map(|m| m.file_type().is_symlink())
        .unwrap_or(false)
}

#[tauri::command]
fn open_vault(path: String, create: bool, name: Option<String>) -> Result<VaultSnapshot, String> {
    let root = PathBuf::from(&path);
    if create {
        fs::create_dir_all(&root).map_err(|e| format!("Unable to create Vault: {e}"))?;
    }
    if !root.is_dir() {
        return Err("Vault path is not a directory".into());
    }
    let canonical = root.canonicalize().map_err(|e| e.to_string())?;
    let tree = read_tree(&canonical)?;
    let vault_name = name
        .filter(|n| !n.trim().is_empty())
        .or_else(|| {
            canonical
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
        })
        .unwrap_or_else(|| "Knowledge Vault".into());
    Ok(VaultSnapshot {
        vault: Vault {
            id: format!("vault:{}", canonical.to_string_lossy()),
            name: vault_name,
            root_path: canonical.to_string_lossy().to_string(),
        },
        tree,
    })
}

fn read_tree(root: &Path) -> Result<Vec<FileTreeNode>, String> {
    let mut nodes = Vec::new();
    let mut entries: Vec<_> = fs::read_dir(root)
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();
    entries.sort_by_key(|e| e.file_name());
    for entry in entries {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') || is_symlink(&entry.path()) {
            continue;
        }
        nodes.push(node_for(root, &entry.path())?);
    }
    Ok(nodes)
}

#[tauri::command]
fn read_file_tree(root_path: String) -> Result<Vec<FileTreeNode>, String> {
    read_tree(&PathBuf::from(root_path))
}

#[tauri::command]
fn read_note(root_path: String, path: String) -> Result<RawNote, String> {
    let root = PathBuf::from(root_path);
    let file = safe_relative(&root, &path)?;
    if !file.is_file() {
        return Err("Note does not exist".into());
    }
    Ok(RawNote {
        path,
        content: fs::read_to_string(&file).map_err(|e| e.to_string())?,
        created_at: iso_time(&file),
        updated_at: iso_time(&file),
    })
}

fn atomic_write(path: &Path, content: &str) -> Result<(), String> {
    let parent = path.parent().ok_or("Invalid note path")?;
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let temp = parent.join(format!(
        ".{}.tmp",
        path.file_name().unwrap_or_default().to_string_lossy()
    ));
    {
        let mut file = fs::File::create(&temp).map_err(|e| e.to_string())?;
        file.write_all(content.as_bytes())
            .map_err(|e| e.to_string())?;
        file.sync_all().map_err(|e| e.to_string())?;
    }
    replace_file(&temp, path)?;
    Ok(())
}

#[cfg(windows)]
fn replace_file(source: &Path, target: &Path) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    let source: Vec<u16> = source
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let target: Vec<u16> = target
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let ok = unsafe {
        windows_sys::Win32::Storage::FileSystem::MoveFileExW(
            source.as_ptr(),
            target.as_ptr(),
            windows_sys::Win32::Storage::FileSystem::MOVEFILE_REPLACE_EXISTING
                | windows_sys::Win32::Storage::FileSystem::MOVEFILE_WRITE_THROUGH,
        )
    };
    if ok == 0 {
        Err("IO_ERROR: atomic replace failed".into())
    } else {
        Ok(())
    }
}

#[cfg(not(windows))]
fn replace_file(source: &Path, target: &Path) -> Result<(), String> {
    fs::rename(source, target).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_note(root_path: String, path: String, content: String) -> Result<(), String> {
    let root = PathBuf::from(root_path);
    let file = safe_relative(&root, &path)?;
    atomic_write(&file, &content)
}

#[tauri::command]
fn create_note(root_path: String, path: String, content: String) -> Result<(), String> {
    let root = PathBuf::from(root_path);
    let file = safe_relative(&root, &path)?;
    if file.exists() {
        return Err("A note already exists at this path".into());
    }
    atomic_write(&file, &content)
}

#[tauri::command]
fn rename_path(root_path: String, path: String, new_name: String) -> Result<(), String> {
    if new_name.is_empty() || new_name.chars().any(|c| matches!(c, '\\' | '/' | ':')) {
        return Err("Invalid name".into());
    }
    let root = PathBuf::from(root_path);
    let source = safe_relative(&root, &path)?;
    let target = source.parent().ok_or("Invalid path")?.join(new_name);
    if target.exists() {
        return Err("A file already exists with that name".into());
    }
    fs::rename(source, target).map_err(|e| e.to_string())
}

#[tauri::command]
fn move_path(root_path: String, path: String, destination: String) -> Result<(), String> {
    let root = PathBuf::from(root_path);
    let source = safe_relative(&root, &path)?;
    let dir = safe_relative(&root, &destination)?;
    if !dir.is_dir() {
        return Err("Destination folder does not exist".into());
    }
    let target = dir.join(source.file_name().ok_or("Invalid path")?);
    if target.exists() {
        return Err("A file already exists at the destination".into());
    }
    fs::rename(source, target).map_err(|e| e.to_string())
}

#[tauri::command]
fn trash_path(root_path: String, path: String) -> Result<(), String> {
    let root = PathBuf::from(root_path);
    let source = safe_relative(&root, &path)?;
    if !source.exists() {
        return Err("Path does not exist".into());
    }
    let trash = root.join(".trash");
    fs::create_dir_all(&trash).map_err(|e| e.to_string())?;
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    let base = format!(
        "{}_{}",
        stamp,
        source.file_name().unwrap_or_default().to_string_lossy()
    );
    let mut target = trash.join(&base);
    let mut suffix = 1;
    while target.exists() {
        target = trash.join(format!("{}_{}", base, suffix));
        suffix += 1;
    }
    fs::rename(source, target).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_vault,
            read_file_tree,
            read_note,
            write_note,
            create_note,
            rename_path,
            move_path,
            trash_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::safe_relative;
    use std::path::Path;

    #[test]
    fn rejects_parent_escape() {
        let root = Path::new("C:/vault");
        assert!(safe_relative(root, "../outside.md").is_err());
        assert!(safe_relative(root, "C:/outside.md").is_err());
    }

    #[test]
    fn accepts_normal_relative_path() {
        assert!(safe_relative(Path::new("C:/vault"), "notes/test.md").is_ok());
    }
}
