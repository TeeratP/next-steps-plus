# next-steps-plus

After each turn, suggests next prompts above the input box. Out of the box it behaves like the original [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps): three short suggestions, and a number key puts one in the prompt box.

```
next: type 1-3 to put one in the prompt box, 0 to dismiss
  1: run the tests you just wrote
  2: do the same for the settings page
  3: /code-review high
  0: dismiss
```

Press `1`, `2` or `3` from an empty prompt box (or click one) and that prompt is written into the box as a draft. Edit it, then press Enter yourself. The plugin never submits a prompt on its own. `0` dismisses.

What it adds is settings (see [Options](#options)): more and longer suggestions, a preview of each full prompt, and multi-select.

## Multi-select

Set `selectMode` to `multi` to pick several suggestions and have them written into the prompt box as one numbered draft:

```
next: type numbers to pick, 9 to use them, 0 to dismiss
  1: [2] Run the tests and fix failures
  2: [ ] Update the README for the new option
  3: [1] Commit the change
  4: [ ] /code-review high (runs alone)
  8: all except commands   9: use selected (2)   0: dismiss
```

Press `1`–`8` from an empty prompt box (or click) to toggle a suggestion. The number in brackets is the order you picked it in. Press `9` to write the picked prompts into the box:

```
Do these in order:
1. Commit the change with a short message describing the new option.
2. Run the unit tests in tests/ and fix any failure, then re-run until green.
```

Edit the draft, then press Enter yourself.

A slash-command suggestion runs alone, because the rest of a prompt would become its arguments. Picking one clears your other picks, and picking anything else clears it.

Press `8` (**all**) to pick every suggestion except slash commands in one go, in the order shown; press it again to clear them. With eight suggestions, `8` belongs to the eighth one, so click **all** instead. It shows in `multi` mode when there are at least two non-command suggestions.

## Based on next-steps

This is a fork of [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) by Thariq Shihipar (MIT), from [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community), commit `f60f045`. The suggestion engine is the original's: forking the session with `$.model.fork`, listing skills, cleaning the text, and dropping unknown commands.

The defaults are the original's. What you can change:

| | next-steps | next-steps-plus default | Can be set to |
| --- | --- | --- | --- |
| Suggestions | 3 | 3 | up to 8 |
| Button label | 48 chars | 48 chars | up to 300 |
| Prompt | 600 chars | 600 chars | up to 4000; `detailed` or `brief` style |
| Full prompt visible before picking | no | no | full prompt dimmed under each label (`previewFlag`) |
| Picking | one | one | several, plus pick all (`selectMode: multi`) |
| Settings | 2 | 11 | |

## Install

At the prompt of a terminal session:

```
/plugin install next-steps-plus --marketplace TeeratP/next-steps-plus
```

Answer `y` to add the marketplace, then pick a scope (user is first).

From a shell:

```
claude plugin install next-steps-plus --marketplace TeeratP/next-steps-plus
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `TeeratP/next-steps-plus`, then Add plugin.

Turn off the original first if you have it, or both will draw a band: `/plugin` → next-steps → Disable.

## Options

Set them on the install screen or later in `/config` (or under `pluginConfigs` in settings). Both screens show each default at the end of the setting's title, e.g. "Label length (default: 48)", so you can leave anything you don't need to change. A change reloads the plugin.

| Option | Default | What it does |
| --- | --- | --- |
| `selectMode` | `single` | `single`: a number key fills that one suggestion (the original behaviour). `multi`: number keys toggle, `8` picks all but commands, `9` fills all picks |
| `maxSuggestions` | `3` | How many suggestions, 1–8 (`9` and `0` are taken; at 8, **all** is click-only) |
| `labelChars` | `48` | Longest button label, 20–300 |
| `promptChars` | `600` | Longest suggested prompt, 200–4000 |
| `previewFlag` | `false` | Show each suggestion's full prompt dimmed under its label |
| `promptStyle` | `standard` | `standard`: no length guidance, as the original. `detailed`: 1–3 sentences with scope and what done looks like. `brief`: one short sentence |
| `combineHeader` | `Do these in order:` | In `multi` mode, the line above the numbered list when several are picked; empty for none |
| `extraInstructions` | (empty) | Your own guidance for the suggester, e.g. `write prompts in Thai` |
| `ghostText` | `true` | Also show the top suggestion as Tab-to-take ghost text in the box |
| `suggestSkills` | `true` | Tell the suggester which skills and slash commands the session has |
| `minAnswerChars` | `80` | Skip suggestions after answers shorter than this |

## Changelog

### v0.1.4

- `previewChars` is replaced by `previewFlag`, an on/off switch. When on, each suggestion's full prompt shows dimmed under its label. A saved `previewChars` value is ignored.

### v0.1.3

- The list now starts with a hint saying which number keys to type.

### v0.1.2

- Defaults now match the original next-steps: `single` select, 3 suggestions, 48-char labels, 600-char prompts, and a new `standard` prompt style (no length guidance). Turn on the rest in `/config`.

### v0.1.1

- Multi-select: number keys toggle suggestions, `9` fills every pick as one numbered draft; slash commands run alone.
- Pick all: `8` (or **all**) picks every suggestion except slash commands; press again to clear.
- Prompt preview off by default (`previewChars: 0`).
- The install screen and `/config` show each setting's default in its title.

## License

MIT, as the original.
