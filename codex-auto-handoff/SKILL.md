---
name: codex-auto-handoff
description: Save task state and start a fresh, numbered chat in the same saved Windows Codex project. Use when the user asks to switch chats, or when early handoff is enabled and the source chat is approaching its context limit.
---

[中文技能说明](references/skill.zh-CN.md)

Confirm that the current request or a standing rule authorizes a handoff. Prepare the checkpoint around 70% of the context window. Around 80%, or before an operation that could produce substantial output, finish the smallest safe step and hand off. Act earlier if the automatic compaction boundary is lower. Use task milestones when reliable usage data is unavailable.

Reuse an existing progress document or write `docs/handoff/<source-thread-id>/STATE.md` inside the project. Include the user's requirements and their sources, parameters and units, decisions and discarded alternatives, the workspace and branch, changes, test results, open questions, and absolute paths for the next action. Identify facts and assumptions. Finish or explicitly transfer ongoing write tasks before dispatch. The source chat should stop modifying the project after transferring ownership. Keep credentials out of the checkpoint. Record the original title and current sequence number for other clients.

Prefer the host's native project lookup and chat creation tools. Verify the saved local project and workspace, then create one empty chat with the checkpoint path and the authorized next action. Append the next number to the original title, starting at 2. Use the Windows fallback only if the host lacks native creation tools. Handle approval refusals within the original approval flow.

Run the following PowerShell command from the source workspace. Replace both placeholders with absolute paths. The host supplies `CODEX_THREAD_ID`. Follow the normal approval flow for user-level access.

```powershell
node '<skill-install-directory>/scripts/handoff.mjs' continue '<absolute-checkpoint-path>' (Get-Command codex.exe).Source
```

Track the receiver by the ID in the receipt. Keep the connection open for long tasks. If the outcome is uncertain, inspect the existing receipt before retrying. If the receiver needs approval or input, direct the user to that chat. If the helper cannot verify the project, preserve permissions, or operate on the host, provide the checkpoint and a one-line continuation prompt for the user to open manually.
