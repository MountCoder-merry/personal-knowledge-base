# Project State

更新时间：2026-10-04

本文档记录当前仓库的真实状态，基于源代码、配置、Git 历史和现有验证结果整理，不代表未来计划已经完成。

## 1. 项目定位

Personal Knowledge Base 是一个 local-first 的个人知识库桌面应用。它把本地 Markdown Vault 组织成文件树，并提供编辑、属性、搜索、标签、Wiki Link、反向链接、模板和 Inbox 等知识管理能力。数据的权威来源仍然是用户本地磁盘上的 Markdown 文件，而不是云端数据库。

目标用户主要是希望掌控本地数据的个人用户，尤其是开发者、技术学习者、研究者，以及需要按主题长期积累 Markdown 笔记的创作者。当前实现不是团队协作产品，也没有账号、云同步或远程后端。

## 2. 当前开发阶段

当前处于 **Prototype / early MVP**：主要用户路径已经存在，桌面开发启动已恢复，但发行和稳定性边界还没有达到 Beta。

本轮已补齐 Tauri 图标并通过 Rust 构建检查，开发模式能够启动 `Personal Knowledge Base` 窗口。仓库当前仍只有一个初始提交 `183a73a chore: initial project snapshot`，本轮修改尚未提交。

## 3. 已实现功能

- Tauri 2 + React 19 + TypeScript + Vite + Zustand 的桌面应用基础。
- 创建 Vault、打开已有 Vault、记录最近打开的 Vault。
- 通过 Tauri 命令扫描真实文件树，读取 Markdown 和 YAML frontmatter。
- Markdown 笔记的稳定 `id`、标题、元数据、正文、创建时间和更新时间模型。
- 源码模式编辑器、属性面板、脏状态和保存。
- 原子写入、路径安全校验、符号链接跳过、回收站式删除、重命名和移动的 Rust 边界。
- 内存知识索引：标题/内容/路径/元数据搜索、标签、Wiki Link 解析、反向链接。
- 新建笔记、模板创建、快速捕获、Inbox 视图。
- 主题切换、三栏布局、状态栏和部分键盘快捷键。
- Tauri bundle 图标资源，Windows 开发启动验证通过。
- 新建空白笔记在缺少 `tags` frontmatter 时不会再导致 Properties 面板渲染崩溃。
- New Note、Quick Capture 支持统一弹窗样式、关闭按钮、Esc 和点击遮罩退出；文件树的重命名、移动、删除改为应用内菜单和确认对话框。
- 基础单元测试覆盖 Markdown 解析、知识索引、模板和创建流程。

## 4. 核心用户流程

1. 启动应用，从最近 Vault 恢复，或在 Vault 对话框中创建/打开一个目录。
2. Tauri 扫描目录并建立文件树、笔记缓存和知识索引。
3. 用户从 Sidebar 选择 Markdown 笔记，在 Editor 中编辑正文，在 Properties 中编辑 frontmatter。
4. 用户保存，应用原子写入 Markdown 文件并重新扫描索引。
5. 用户通过搜索、标签、Wiki Link、反向链接或 Inbox 找到其他笔记。
6. 用户创建笔记、快速捕获内容，或通过右键操作重命名、移动和删除文件。

## 5. 明显未完成或未验证的部分

- 没有真实桌面启动 smoke test、安装包或 release 流程。
- Tauri CLI 报告 npm 包与 Rust crate 的 minor 版本不一致，尚未统一依赖版本。
- 文件操作的冲突策略、错误码和用户确认流程不完整。
- 新建笔记仍使用自由文本路径，没有文件夹选择器和可靠的同名冲突提示。
- 删除、重命名、移动、切换 Vault 等操作对脏编辑的保护不一致。
- UI 缺少统一的 loading、空状态、成功反馈和错误恢复体验。
- 模板默认初始化、增量文件监听、持久化设置和完整可访问性尚未完成。
- 没有 SQLite、全文搜索引擎、Embedding、Vector DB、RAG、LLM、云同步或账号系统；这些不属于当前实现。

## 6. 技术债与可扩展性风险

- `vaultStore` 同时编排 Vault、文件操作、索引和编辑草稿；它仍可工作，但后续应拆分用例边界，而不是继续堆叠 action。
- 新建笔记存在多个入口（普通创建、模板、capture），冲突检查和路径规范化没有完全统一。
- Tauri 错误目前主要以 raw string 返回，前端无法稳定区分路径、权限、冲突、解析和 IO 错误。
- 每次保存/移动/重命名都会完整扫描和读取索引；正确性优先，但 Vault 较大时会产生明显延迟。
- `notesByPath` 在重命名/移动后存在缓存重键风险；部分操作以 fire-and-forget Promise 调用，可能出现未处理 rejection。
- `parseMarkdown` 对不支持的嵌套 YAML frontmatter 会拒绝整篇笔记，且没有保留未知结构的兼容策略。
- `TopBar` 与全局快捷键 hook 对快捷键存在重复实现；`window.prompt` 被用于多个核心确认流程。
- 已修复一个 P1 白屏问题：空白笔记缺少 `tags` 时 Properties 面板曾直接调用 `.map`。
- 仍存在旧的 demo 数据和 demo-vault UI 状态，以及与实际代码不一致的 Foundation 文档。
- 部分组件和 CSS 为压缩/单行形式，降低了审查和局部修改的可读性。

## 7. 测试覆盖缺口

目前没有覆盖 Tauri 命令的 Rust 集成测试，也没有真实文件系统的原子写入、路径穿越、符号链接、回收站、重命名/移动冲突测试。前端没有桌面级 E2E 测试，Vault 创建、保存失败恢复、未保存切换、删除确认和快捷键冲突等关键路径仍主要依赖人工验证。可访问性、响应式布局和大型 Vault 性能也未纳入自动化测试。

## 8. 用户体验问题

- 浏览器预览环境不能调用原生文件夹选择器；如果误以为浏览器预览就是桌面应用，容易得到 `invoke` 相关错误。
- 创建 Vault 时父目录选择和名称校验不够直观；创建笔记时 location 是自由文本。
- 文件操作失败通常只回到通用错误字符串，缺少针对性建议和重试入口。
- Inbox、搜索结果和索引失败没有完整的 loading/empty/error 状态。
- Sidebar 顶部的快速创建仍使用 `prompt`；文件树的重命名、移动、删除已改为应用内上下文菜单和对话框。
- 属性面板可以展示 Tags，但还不是完整的标签编辑体验。

## 9. 文档一致性

README、`docs/architecture.md` 和 `docs/data-model.md` 仍主要描述 Foundation/demo 阶段，遗漏真实文件树、索引、搜索、模板、capture、Wiki Link 和 backlinks。`docs/roadmap.md` 存在重复的 Phase 4 标题和阶段描述。本文档和 `IMPROVEMENT_BACKLOG.md` 用于建立新的事实基线；原文档应在后续 P1 文档同步任务中逐步修正。

## 10. 工程验证基线

本轮实际执行：

- `npm run typecheck` — PASS
- `npm run test` — PASS（3 个测试文件，11 个测试）
- `npm run build` — PASS
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` — PASS
- `cargo check --manifest-path src-tauri/Cargo.toml --offline` — PASS
- `npm run tauri dev` — PASS（窗口进程成功启动，随后手动停止）
- 桌面启动时仍有 Tauri npm/crate minor version mismatch 警告，尚未作为本轮范围修复
- `npm run lint` — 未执行：项目没有 lint script

## 11. 当前结论

前端和核心本地文件操作架构已经超过最初的 UI skeleton，Tauri 开发构建阻塞已解除，但项目仍是早期 MVP。下一轮应优先补齐文件操作错误模型与关键流程测试，再同步文档和正式 release 基础设施。当前阶段不应继续扩展 AI、云同步或复杂插件系统。
