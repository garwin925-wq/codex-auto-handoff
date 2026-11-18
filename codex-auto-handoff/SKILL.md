---
name: codex-auto-handoff
description: Save task state and start a fresh, numbered chat in the same saved Windows Codex project. Use when the user asks to switch chats, or when early handoff is enabled and the source chat is approaching its context limit.
---

[中文技能说明](references/skill.zh-CN.md)

Confirm that the current request or a standing rule authorizes a handoff. Prepare the checkpoint around 70% of the context window. Around 80%, or before an operation that could produce substantial output, finish the smallest safe step and hand off. Act earlier if the automatic compaction boundary is lower. Use task milestones when reliable usage data is unavailable.

Reuse an existing progress document or write `docs/handoff/<source-thread-id>/STATE.md` inside the project. Include the user's requirements and their sources, parameters and units, decisions and discarded alternatives, the workspace and branch, changes, test results, open questions, and absolute paths for the next action. Identify facts and assumptions. Finish or explicitly transfer ongoing write tasks before dispatch. The source chat should stop modifying the project after transferring ownership. Keep credentials out of the checkpoint. Record the original title and current sequence number for other clients.

## Check for omissions

As soon as an important correction, limit or acceptance condition arrives, record its exact wording, source and a concrete check. Keep the project document as the source of truth. For automatic handoff, maintain a JSON companion beside the checkpoint named `<checkpoint-filename>.<source-thread-id>.requirements.json`. Each entry represents one currently applicable requirement, for example:

```json
[{"quote":"Keep the threshold at 80%","source":"User correction in turn 2","check":"Verify the configured threshold is still 80% after testing."}]
```

Before dispatch, compare the list with the latest user corrections, earlier still-active constraints, pending work, changes and test evidence. Add missing requirements and preserve the history of superseded decisions in the project document. Use a precise redacted excerpt or a reference for sensitive details. For native dispatch, include the companion's absolute path in the first message. Ask the receiver to read every entry and identify the next action, applicable constraints and acceptance checks before editing. Resolve discrepancies from the cited sources. Ask the user only if an unresolved detail affects the work.

Prefer the host's native project lookup and chat creation tools. Verify the saved local project and workspace, then create one empty chat with the checkpoint path and the authorized next action. Append the next number to the original title, starting at 2. Use the Windows fallback only if the host lacks native creation tools. Handle approval refusals within the original approval flow.

Run the following PowerShell command from the source workspace. Replace both placeholders with absolute paths. The host supplies `CODEX_THREAD_ID`. Follow the normal approval flow for user-level access.

```powershell
node '<skill-install-directory>/scripts/handoff.mjs' continue '<absolute-checkpoint-path>' (Get-Command codex.exe).Source
```

Track the receiver by the ID in the receipt. Keep the connection open for long tasks. If the outcome is uncertain, inspect the existing receipt before retrying. If the receiver needs approval or input, direct the user to that chat. If the helper cannot verify the project, preserve permissions, or operate on the host, provide the checkpoint and a one-line continuation prompt for the user to open manually.
