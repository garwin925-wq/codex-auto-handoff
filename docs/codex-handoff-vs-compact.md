# Codex context handoff vs. /compact

[简体中文](codex-handoff-vs-compact.zh-CN.md) · [Setup guide](why-codex-auto-handoff.md)

| Workflow | What carries forward? | Who opens the next chat and sends the task? |
| --- | --- | --- |
| `/compact` | A summary within the current conversation | Work continues in the current chat |
| Manual `HANDOFF.md` | The notes and source references you choose | You select the project, open a chat and give it the file |
| A tool that only generates a checkpoint | The document that tool writes | A person or a separate dispatcher handles chat creation and submission |
| Codex Auto Handoff | A structured checkpoint, project files and applicable requirements | Codex creates a distinct chat in the same saved project, numbers its title and sends the next authorized step |

During an investigation, `/compact` lets you keep the current chat. At a stage boundary, a checkpoint makes the next action inspectable. A manual handoff also works well if you want to review the notes and decide when to switch.

**Windows dispatch.** Native tools are preferred. With a compatible CLI, the App Server fallback verifies the workspace and settings, requests a new chat ID and starts a receiving turn. Titles follow the sequence `Build`, `Build2`, `Build3`. The fallback claims a separate receipt per source chat to prevent duplicate dispatch. The receipt records destination and turn status; confirm task success with the output or test named in the checkpoint. [Windows acceptance test](windows-acceptance.en.md)
