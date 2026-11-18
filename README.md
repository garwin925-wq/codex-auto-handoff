# Codex Auto Handoff

**Windows 上的 Codex 聊天上下文快满了，怎么在同一个项目开新对话，接着完成原来的任务？**

安装后，在原聊天中发送 `$codex-auto-handoff` 即可手动交接。要启用自动换聊，可以[配置全局规则](#设为默认)，让 Codex 在交接点保存进度并开启新聊天。可选的 [PostToolUse hook](codex-auto-handoff/references/hooks.md) 会在工具调用后参考最近一次请求的用量，提醒 Codex 准备或执行上下文交接。

**Windows 实测结果**：原聊天保存了交接文件，技能在同一项目中创建了新聊天，新聊天接着执行任务并写出了预期的验收值。受控交接点已验证，自然达到阈值仍待观察。

接续聊天沿用原标题并连续编号，例如「项目规划2」「项目规划3」。

## 安装

将仓库中的 `codex-auto-handoff/` 目录安装到用户 Codex 的 `skills/` 下。也可以把该目录的 GitHub 链接交给 Codex 的 skill-installer。新回合可使用 `$codex-auto-handoff`。

需要在没有原生创建工具时接续的用户，应安装 Node.js 20+ 并确保 Codex CLI 可用。备用程序使用实验性 App Server 协议，要求客户端提供项目归属、聊天创建和文件权限信息。实际工具和交互式审批能力因客户端而异。

## 设为默认

在用户级 `AGENTS.md` 的实际生效文件中加入：“有未完成工作且接近上下文上限、或即将产生大量输出时，使用 $codex-auto-handoff 在同一项目换聊，沿用已授权的下一步。”仅安装技能即可手动调用，开箱不会编辑用户配置。

可选的工具调用后提醒见 [用量提示配置](codex-auto-handoff/references/hooks.md)。读不到可靠用量时，由助手按阶段保存。工具调用后的检查不能保证在任意一次系统压缩前运行。

## 验证与卸载

在仓库根目录运行 `node --test tests/handoff.test.mjs`。单元测试覆盖阈值、编号及明确的权限拒绝。

卸载时先移除自己添加的用量 hook 和全局指令，再移除技能目录。项目交接文件可继续使用。默认的去重收据及编号记录在用户 Codex 目录的 `handoff-state/` 下。保留记录有助于核对已创建的聊天。
