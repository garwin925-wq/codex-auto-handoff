# Optional PostToolUse reminder

[中文](hooks.zh-CN.md)

Locate the absolute paths to Node.js and the installed skill's script. Append the following group to the `hooks.PostToolUse` array in your user-level `hooks.json`. Preserve existing events and groups. Replace both placeholders, retaining the quotes around paths and escaping Windows backslashes in JSON.

```json
{"matcher":"*","hooks":[{"type":"command","command":"\"<absolute path to Node.js>\" \"<absolute path to scripts/handoff.mjs>\" signal","timeout":6,"statusMessage":"Check context for handoff"}]}
```

Review and trust the hook in the Codex client's Hooks settings. The helper uses the latest request's token count and recorded context window to suggest preparing or starting a handoff. Cumulative token usage cannot measure the current window. Long logs or missing telemetry may result in no reminder. Automatic compaction interception is a separate client configuration.
