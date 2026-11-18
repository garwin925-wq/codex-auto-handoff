# Windows Codex context handoff: what the receiving chat actually did

The test ran on Windows 11 25H2 (build 26200.8457), with Codex CLI 0.169.0-alpha.11.1. It exercised the App Server fallback in the [initial public skill](https://github.com/garwin925-wq/codex-auto-handoff/tree/7ed4cd2).

1. The source chat wrote a checkpoint containing a fresh random value and the absolute path of the result file. It handed over the test directory and ended its turn.
2. The test driver called the skill's dispatch function. It requested a fresh thread in the saved project and checked the returned project ID and working directory before sending the first message. The two session logs had different chat IDs and the same working directory.
3. The receiving chat wrote the value to the result file. The driver independently read that file and matched it against the original random value. The dispatch receipt recorded completion and release of the client's write ownership.

This verifies new-chat continuation at a deliberately chosen checkpoint. It does not measure how often the usage hook prompts the source chat in time during everyday work. The [detailed test record and event replay](windows-acceptance.md) include reproducible steps and file hashes.
