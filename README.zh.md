# Grandpa: 面向 AI 编程智能体的零臃肿架构引擎

> *"想当年，我们从来不需要装 500MB 的依赖库去算两个数的和。"*

Grandpa 是专为现代 AI 编程智能体（Claude Code、Cursor、Windsurf、Devin、GitHub Copilot）设计的零臃肿架构标准与工程安全引擎。

---

## 核心亮点

1. **零多余外部依赖**：用 Node.js 与 Web 标准库直接替换 `axios`、`moment`、`lodash`、`uuid`、`rimraf` 等。
2. **剔除肥肉，保留骨骼（Cut the fat, never cut the bone）**：绝不为了追求代码行数缩减而随意删减错误捕获、超时保护与安全校验。
3. **主动式 CLI 扫描器**：一键运行 `npx grandpa scan` 评估代码库健康度。
4. **Git Pre-commit 守门人**：在提交阶段拦截 AI 私自引入的不良依赖。
5. **官方 MCP 服务**：全面支持 Claude Desktop 与各类兼容 Model Context Protocol 的编辑器。

---

## 快速上手

```bash
# 扫描当前项目
npx @bytewhisker/grandpa scan

# 一键初始化 Cursor / Windsurf / Claude 规则
npx @bytewhisker/grandpa init

# 安装 Git Pre-commit 守卫
npx @bytewhisker/grandpa hook
```
