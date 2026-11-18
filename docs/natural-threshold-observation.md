# Natural context usage observation on Windows

On 2026-11-18, we used the existing project conversation that had already handled the Windows handoff deployment, skill packaging, GitHub publication, and discovery checks. During this observation, the conversation continued with a review of the installed hooks, the release helper, and the existing acceptance evidence. We used ordinary task inputs and left the model, context window and handoff thresholds as configured.

- Windows 11 25H2, Codex Desktop package 26.1111.2228.0, CLI 0.169.0-alpha.11.1.
- The local deployment reported the PostToolUse reminder and PreCompact hook as enabled and trusted. This checks configuration, and does not establish that every tool call invokes the reminder.
- The latest recorded request at the measurement cutoff used 259,059 of 475,000 tokens (54.5%). The calculation used the last request's token total and its recorded model window, not cumulative usage. None of the 198 available usage samples in the project chat through the cutoff reached 70% or 80%. The window can vary by request.
- Neither threshold was reached in the observation. No threshold-driven handoff or receiving turn was observed. The outcome for natural threshold-triggered continuation remains inconclusive.

The [earlier controlled checkpoint test](windows-acceptance.en.md) separately verified that a receiving chat in the same project performed the saved next action and wrote the expected result to disk.

## 中文记录

2026-11-18 复用真实项目长聊。此前已在这条聊天里部署换聊、打包技能、发布 GitHub 并检查可发现性。这轮继续核对本机 hook、发布脚本与验收证据，按实际工作读取材料，沿用已有模型、窗口和阈值。

核对时最新一次请求记录为 259,059 / 475,000 tokens，约 54.5%。本聊天截至该时点有 198 条可用用量记录，没有达到 70% 或 80%。这次未自然触发换聊，也没有接收聊天执行下一步，因此自然触发链路仍未完成验收。[之前的受控接续验收](windows-acceptance.md)已单独验证新聊天在同项目执行并写出预期结果。
