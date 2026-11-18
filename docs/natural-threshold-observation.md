# Natural context usage observation on Windows

[中文](natural-threshold-observation.zh-CN.md)

On 2026-11-18, we used the existing project conversation that had already handled the Windows handoff deployment, skill packaging, GitHub publication, and discovery checks. During this observation, the conversation continued with a review of the installed hooks, the release helper, and the existing acceptance evidence. We used ordinary task inputs and left the model, context window and handoff thresholds as configured.

- Windows 11 25H2, Codex Desktop package 26.1111.2228.0, CLI 0.169.0-alpha.11.1.
- The local deployment reported the PostToolUse reminder and PreCompact hook as enabled and trusted. This checks configuration, and does not establish that every tool call invokes the reminder.
- The latest recorded request at the measurement cutoff used 259,059 of 475,000 tokens (54.5%). The calculation used the last request's token total and its recorded model window, not cumulative usage. None of the 198 available usage samples in the project chat through the cutoff reached 70% or 80%. The window can vary by request.
- Neither threshold was reached in the observation. No threshold-driven handoff or receiving turn was observed. The outcome for natural threshold-triggered continuation remains inconclusive.

The [earlier controlled checkpoint test](windows-acceptance.en.md) separately verified that a receiving chat in the same project performed the saved next action and wrote the expected result to disk.

## Follow-up on 2026-11-18

### A resumed work conversation completed its task below the threshold

An existing conversation with an unfinished local acceptance check last recorded 203,171 / 258,400 tokens (78.6%). We queued a normal continuation of that project task in the owning desktop client. The resumed turn reported a 475,000-token window. Usage went from 218,927 (46.1%) to 227,345 tokens (47.9%) while the chat completed two local filesystem acceptance cases with synthetic data. No threshold was changed, no transcript was padded, and this run did not trigger a handoff.

### A separate real task did trigger a handoff and complete in the new chat

The candidate search also uncovered a separate production-use conversation from earlier the same day. During an ordinary request to verify a project's existing service setup, the source log recorded the PostToolUse handoff reminder. The adjacent usage sample was 430,090 / 475,000 tokens (90.5%). The source chat wrote a checkpoint and invoked the locally deployed Windows App Server helper. The original request was for project work, with no instruction to force a threshold or a handoff. The helper used the host's normal approval path.

We checked the source and receiver through Codex App Server. They had distinct chat IDs and the same working directory. The source had no stored project ID. The helper resolved its saved project by its directory, and the receiver's project ID matched the receipt. The receiving turn read the checkpoint, completed the requested read-only service and DNS checks, and reported the findings. Its turn and dispatch receipt were both completed, with writer ownership released. This is evidence of one naturally triggered handoff on the local deployment. The first observed reminder was already above 90%, so the record cannot establish exact trigger timing at 80%, reliability across all chats, or an equivalent outcome on a fresh installation of the public skill.
