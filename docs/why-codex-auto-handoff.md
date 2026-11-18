# How to Automatically Start a New Codex Chat Before the Context Limit

[简体中文](why-codex-auto-handoff.zh-CN.md) · [Documentation](index.md)

Use a handoff when a long task has a clear next action. For example, after fixing a Windows build, save the failing test, patch location and command the next chat should run. Both chats use the same workspace. The receiver gets a new ID and reads the checkpoint instead of inheriting the full conversation.

## How do I start a new Codex conversation automatically?

1. In Windows Codex Desktop, open a saved local project. Follow the [installation steps](../README.md#installation-and-requirements).
2. Add the [standing instruction](../README.md#enable-automatic-handoff) to authorize automatic new-chat continuation. Optionally configure and trust the [usage reminder](../codex-auto-handoff/references/hooks.md).
3. Continue working. Around 70% the skill asks Codex to prepare a checkpoint. Around 80%, or before a large output, Codex can finish a safe step, save state and dispatch. If a compaction boundary comes sooner, prepare earlier. You can also send `$codex-auto-handoff` at a convenient stopping point.

## How does the new chat know where to continue?

The checkpoint records the working directory, decisions, changes, constraints, completed checks, open questions and the next authorized action. A per-source requirements list can carry corrections and acceptance checks. Finish or transfer any outstanding writes. The receiver checks those records against the workspace before editing. See the [skill instructions](../codex-auto-handoff/SKILL.md).

For Windows Codex automation, the skill prefers native project and chat tools. The App Server fallback checks the project and supported permissions, calls `thread/start` and sends the next task with `turn/start`. If dispatch times out, check the fallback receipt for the destination ID before trying again. Approval or missing user input can require interaction in the receiving chat.

## Can handoff prevent Codex context compaction?

The optional hook checks recorded usage **after a tool call**. It can prompt Codex to switch early, but cannot guarantee a switch before every compaction. With unavailable telemetry, use task milestones. Use `/compact` to summarize context inside the current chat. For Codex context rollover into a fresh session, use a checkpoint and handoff. [Compare the workflows](codex-handoff-vs-compact.md).

## What has been verified?

A Windows receiver executed the saved next action and produced an independently checked file in a [controlled test](windows-acceptance.en.md). In a [real local deployment](natural-threshold-observation.md#follow-up-on-2026-11-18), a reminder was observed around 90.5% and the receiving chat completed the follow-up. Exact trigger timing on a fresh installation remains unverified.
