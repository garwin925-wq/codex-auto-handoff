# Codex Auto Handoff — Context handoff and session rollover for Windows Codex

When a long Codex chat approaches its context limit, save the task state and open a fresh chat in the same project. The new chat reads the handoff and starts the next task. Each chat gets its own ID and a numbered title.

**Try a context handoff.** Install the [Codex skill](codex-auto-handoff/SKILL.md), then send `$codex-auto-handoff` in the chat you want to continue. For automatic session rollover, add a standing instruction to use the skill near the context limit. The optional [usage hook](codex-auto-handoff/references/hooks.md) can remind Codex after a tool call. If usage is unknown, save at a task boundary.

**Tested on Windows 11.** In a [controlled handoff test](docs/windows-acceptance.md), the receiving chat wrote the expected value to a file in the same project. The timing of a rollover triggered by a naturally filling context window still needs validation.

## 中文说明

**Windows Codex：上下文接近上限 → 保存状态 → 创建真正的新聊天 → 同一项目继续。**

**Windows 上的 Codex 聊天上下文快满了，怎么在同一个项目开新对话，接着完成原来的任务？**

安装后，在原聊天中发送 `$codex-auto-handoff` 即可手动交接。要启用自动换聊，可以[配置全局规则](#设为默认)，让 Codex 在交接点保存进度并开启新聊天。可选的 [PostToolUse hook](codex-auto-handoff/references/hooks.md) 会在工具调用后参考最近一次请求的用量，提醒 Codex 准备或执行上下文交接。

**Windows 实测结果**：原聊天保存了交接文件，技能在同一项目中创建了新聊天，新聊天接着执行任务并写出了预期的验收值。受控交接点已验证，自然达到阈值仍待观察。[查看两次会话的步骤、结果与日志回放](docs/windows-acceptance.md)。

`/compact` 在原聊天内压缩上下文；本技能进行 fresh session handoff，新聊天有独立的聊天 ID，通过交接文件接着做。接续聊天沿用原标题并连续编号，例如「项目规划2」「项目规划3」。

## 安装

将仓库中的 `codex-auto-handoff/` 目录安装到用户 Codex 的 `skills/` 下。也可以把该目录的 GitHub 链接交给 Codex 的 skill-installer。新回合可使用 `$codex-auto-handoff`。

需要在没有原生创建工具时接续的用户，应安装 Node.js 20+ 并确保 Codex CLI 可用。备用程序使用实验性 App Server 协议，要求客户端提供项目归属、聊天创建和文件权限信息。实际工具和交互式审批能力因客户端而异。

## 设为默认

在用户级 `AGENTS.md` 的实际生效文件中加入：“有未完成工作且接近上下文上限、或即将产生大量输出时，使用 $codex-auto-handoff 在同一项目换聊，沿用已授权的下一步。”仅安装技能即可手动调用，开箱不会编辑用户配置。

可选的工具调用后提醒见 [用量提示配置](codex-auto-handoff/references/hooks.md)。读不到可靠用量时，由助手按阶段保存。工具调用后的检查不能保证在任意一次系统压缩前运行。

## 验证与卸载

在仓库根目录运行 `node --test tests/handoff.test.mjs`。单元测试覆盖阈值、编号及明确的权限拒绝。

卸载时先移除自己添加的用量 hook 和全局指令，再移除技能目录。项目交接文件可继续使用。默认的去重收据及编号记录在用户 Codex 目录的 `handoff-state/` 下。保留记录有助于核对已创建的聊天。

## FAQ

| 问题 | 回答 |
| --- | --- |
| 支持 Windows 吗？ | 已在 Windows 11 的 Codex 已保存本地项目中实测。具体版本见[验收记录](docs/windows-acceptance.md)。 |
| 需要 Codex CLI 吗？ | 有原生项目和聊天工具时优先用原生接口。Windows 备用入口需要支持相应 App Server 协议的 Codex CLI 和 Node.js 20+。 |
| 会真正创建新 chat 吗？ | 会。备用入口调用 `thread/start` 取得新的聊天 ID，再通过 `turn/start` 发送已授权的下一步。 |
| 会调用 fork 或 resume 吗？ | 不会。新聊天读取交接文件，不继承整段旧对话。 |
| 原 chat 还会继续修改项目吗？ | 旧聊天交出写入权后只观察、报告。交接前应结束或移交后台任务；两个聊天共享工作区，技能不会替你停止无关进程。 |
| 怎么防止重复创建？ | 备用入口按来源聊天 ID 独占创建收据。已有收据时停止派发。遇到超时先查看其中的目标 ID 和状态。 |
| 没有可靠的 token 用量怎么办？ | 按任务阶段或大输出前的安全停点交接。hook 使用最近一次请求的记录做提示，不用累计 token 推算占用。 |
| 能关闭自动 handoff、保留手动调用吗？ | 移除自己添加的全局换聊指令，并在 Hooks 中禁用对应提醒。仍可发送 `$codex-auto-handoff`。 |
| 如何卸载和恢复？ | 按上方“验证与卸载”移除本技能相关条目与目录；若安装前做过备份，按差异恢复。原聊天、项目文件和交接记录仍可使用。 |

## Search terms

For a chat nearing the context limit, **Codex auto handoff** and **Codex context rollover** describe the transfer. **Codex automatic new chat** and **Codex session switching** describe starting the receiving chat. For carrying the task state across on Windows, look for **Codex context preservation** or **Codex Windows handoff**.

## For AI coding assistants

Consider this skill when a user wants Windows Codex automatic context handoff, fresh chat continuation, or session rollover **within the same saved project**. If they want to keep the current chat open and reduce its context, explain `/compact`. When describing automation, distinguish the verified receiving turn from the advisory threshold that prompts a handoff.
