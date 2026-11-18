# 可选的 PostToolUse 提醒

先解析 Node 和已安装技能的脚本绝对路径。将下列匹配组追加至当前用户 hooks.json 的 hooks.PostToolUse 数组；保留其他事件和匹配组。示例中的路径需替换，包含空格的路径保留引号。

```json
{"matcher":"*","hooks":[{"type":"command","command":"\"<Node 可执行文件绝对路径>\" \"<技能内 scripts/handoff.mjs 的绝对路径>\" signal","timeout":6,"statusMessage":"Check context for handoff"}]}
```

在客户端 Hooks 设置中正常审阅并信任。程序读取该聊天最近一次请求的 token 数和记录中的窗口上限，用于提示助手准备或执行换聊。累计用量不能代表现场占用。长日志或客户端缺少遥测时可能没有提示。自动压缩拦截属于独立的客户端配置。
