# next-steps-plus

After each answer, Claude Code suggests what you might ask next, shown above the prompt box. Type a number to put that suggestion in the prompt box, edit it if you like, and press Enter. The plugin never sends a prompt on its own.

```
next: type 1-3 to put one in the prompt box, 0 to dismiss
  1: run the tests you just wrote
  2: do the same for the settings page
  3: /code-review high
  0: dismiss
```

Out of the box it works like the original [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) plugin. What it adds is [settings](#settings): more and longer suggestions, a preview of each full prompt, and picking several suggestions at once.

## Install

At the prompt of a terminal session:

```
/plugin install next-steps-plus --marketplace TeeratP/next-steps-plus
```

Answer `y` to add the marketplace, then pick a scope (user is first). The install screen then shows the settings; you can skip them all, since each title shows its default.

From a shell instead:

```
claude plugin install next-steps-plus --marketplace TeeratP/next-steps-plus
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `TeeratP/next-steps-plus`, then Add plugin.

If you have the original next-steps installed, turn it off (`/plugin` → next-steps → Disable), or you will see two suggestion lists.

## Picking several suggestions

Set `selectMode` to `multi`. Each number key then ticks or unticks a suggestion, and `9` puts all the ticked ones in the prompt box together:

```
next: type numbers to pick, 9 to use them, 0 to dismiss
  1: [2] Run the tests and fix failures
  2: [ ] Update the README for the new option
  3: [1] Commit the change
  4: [ ] /code-review high (runs alone)
  8: all except commands   9: use selected (2)   0: dismiss
```

The number in brackets is the order you ticked them in, and that is the order they are written in. Here, pressing `3`, then `1`, then `9` writes:

```
Do these in order:
1. Commit the change with a short message describing the new option.
2. Run the unit tests in tests/ and fix any failure, then re-run until green.
```

- `8` ticks every suggestion except slash commands; press it again to untick them. When there are eight suggestions, `8` is the eighth one, so click **all** instead.
- A slash command (`/code-review high`) can only be used on its own, because anything after it would be read as its arguments. Ticking it unticks the others, and ticking anything else unticks it.

## Settings

Change them on the install screen, or later in `/config`. A change takes effect right away.

| Setting | Default | What it does |
| --- | --- | --- |
| `selectMode` | `single`\* | `single`: a number key puts that one suggestion in the prompt box. `multi`: pick several, as [above](#picking-several-suggestions) |
| `maxSuggestions` | `3`\* | How many suggestions to show, 1–8 |
| `labelChars` | `48`\* | Longest suggestion label, 20–300 characters |
| `promptChars` | `600`\* | Longest suggested prompt, 200–4000 characters |
| `previewFlag` | off\* | Show each suggestion's full prompt, dimmed, under its label |
| `promptStyle` | `standard`\* | How long the suggested prompts are. `standard`: no guidance. `detailed`: 1–3 sentences saying what to do, where, and what done looks like. `brief`: one short sentence |
| `combineHeader` | `Do these in order:` | `multi` only: the line above the list when several are picked; leave empty for none |
| `extraInstructions` | none | Your own wishes for the suggestions, e.g. `write prompts in Thai` |
| `ghostText` | on\* | Also show the top suggestion as faint text in the empty prompt box; Tab takes it |
| `suggestSkills` | on\* | Let suggestions be your skills and slash commands |
| `minAnswerChars` | `80`\* | No suggestions after answers shorter than this many characters |

\* Same as the original next-steps. Settings without \* are new in this plugin.

## Credits

A fork of [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) by Thariq Shihipar (MIT), from [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community) at commit `f60f045`. The way suggestions are made is the original's; this plugin adds the settings and multi-select.

## Changelog

### v0.1.4

- `previewChars` (a length) is replaced by `previewFlag` (on/off). When on, the whole prompt shows.

### v0.1.3

- The list starts with a hint saying which number keys to type.

### v0.1.2

- Defaults now match the original next-steps: pick one, 3 suggestions, 48-character labels, 600-character prompts, and the new `standard` prompt style.

### v0.1.1

- Multi-select: tick several suggestions with number keys and write them all with `9`.
- `8` ticks every suggestion except slash commands.
- Prompt preview off by default.
- The install screen and `/config` show each setting's default in its title.

## License

MIT, as the original.
