# Privacy policy

next-steps-plus is a Claude Code plugin that runs inside your own Claude Code session. It has no server, account or analytics of its own.

## What it reads

- **Your conversation, through Claude.** After an answer finishes (and only for answers of at least 80 characters), it asks one short question to a fork of your current Claude Code session to get suggestions. That request goes to Claude through Claude Code, the same way your own prompts do; the plugin sends it nowhere else.
- **Its own settings,** and the list of skills and slash commands you have, so it suggests only ones that exist.

## What it stores

Nothing outside Claude Code. Its settings are saved in your Claude Code settings like any other plugin's, and it changes only its own settings (the `next-steps-plus.*` rows in `/config`).

## What it sends

Nothing to any other service. It makes no network requests of its own, collects no telemetry, and shares no data with the author or anyone else.

## Personal data

The plugin doesn't collect, store or sell personal data. Whatever is in your conversation is handled by Claude Code and Anthropic under their own terms; the plugin adds nothing to that.

## Contact

Questions: open an issue at https://github.com/TeeratP/next-steps-plus/issues.
