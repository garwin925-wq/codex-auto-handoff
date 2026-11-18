# Windows 上如何在 Codex 上下文快满前自动新建聊天继续任务

[English](why-codex-auto-handoff.md) · [文档索引](index.md)

要让 Codex 自动换聊天，先选好一个能安全交接的步骤。例如 Windows 构建已修好，接下来只需跑回归测试。把失败用例、改动位置和测试命令写入交接，新聊天在原工作区读取这些资料并继续执行。新聊天有独立 ID，不会继承整段旧聊天历史。

## 开启自动续接

1. 在 Windows Codex Desktop 中打开已保存的本地项目，按[安装说明](../README.zh-CN.md#安装)装好技能。
2. 添加[全局换聊规则](../README.zh-CN.md#设为默认)，可选配置并信任[用量提醒](../codex-auto-handoff/references/hooks.zh-CN.md)。
3. 正常工作。约 70% 时准备交接，约 80% 或可能产生大量输出前完成安全小步骤，再保存现场并派发。若自动压缩边界更早，提前准备。也可以在任意合适的停点发送 `$codex-auto-handoff` 手动调用。

## 跨聊天时要保存什么？

交接文件保留工作目录、决定、约束、修改、已验证结果、待确认事项和已授权的下一步。按来源聊天维护的要求清单可保留用户纠正及验收方法。先结束或移交仍会写文件的任务，新聊天动手前回查交接与工作区。[技能说明](../codex-auto-handoff/references/skill.zh-CN.md)

Windows Codex 自动续接优先用宿主的原生工具。App Server 后备程序核对项目和可保留的权限，再通过 `thread/start` 新建聊天、通过 `turn/start` 发送下一步。超时先看收据里的目标 ID。需要审批或用户补充信息时，在已创建的新聊天处理。

## 能防止系统压缩吗？

可选 hook 在工具调用结束后读取用量记录，无法保证赶在每一次压缩之前。用量未知时按任务阶段交接。`/compact` 在当前聊天内压缩上下文；要开始独立新会话并保留项目进度，可使用检查点和交接。[方式对比](codex-handoff-vs-compact.zh-CN.md)

## Windows 验证到了哪一步？

[受控验收](windows-acceptance.md)中，新聊天完成了原任务的下一步并写出可独立核对的文件。另一次[真实本地使用](natural-threshold-observation.zh-CN.md)中，约 90.5% 时观察到换聊提醒，接收聊天完成了后续工作。新安装环境在阈值附近的精确触发时机仍待验证。
