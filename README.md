# next-steps-plus

After each turn, suggests next prompts above the input box. You can pick several and have them written into the prompt box as one numbered draft.

```
next: press numbers to pick, 9 to use them
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

Only the labels show by default. Set `previewChars` (e.g. `240`) to also see each full prompt dimmed under its label before you pick.

Edit the draft, then press Enter yourself. The plugin never submits a prompt on its own. `0` dismisses.

A slash-command suggestion runs alone, because the rest of a prompt would become its arguments. Picking one clears your other picks, and picking anything else clears it.

Press `8` (**all**) to pick every suggestion except slash commands in one go, in the order shown; press it again to clear them. With eight suggestions, `8` belongs to the eighth one, so click **all** instead. It shows in `multi` mode when there are at least two non-command suggestions.

## Based on next-steps

This is a fork of [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) by Thariq Shihipar (MIT), from [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community), commit `f60f045`. The suggestion engine is the original's: forking the session with `$.model.fork`, listing skills, cleaning the text, and dropping unknown commands.

What changed:

| | next-steps | next-steps-plus |
| --- | --- | --- |
| Suggestions | 3 | 5 by default, up to 8 |
| Button label | 48 chars | 120 chars by default |
| Prompt | 600 chars | 1500 chars by default, asked to be 1–3 sentences with scope |
| Full prompt visible before picking | no | optional dim preview under each label (`previewChars`) |
| Picking | one | several (or one, with `selectMode: single`) |
| Settings | 2 | 11 |

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

Set them in `/config` (or under `pluginConfigs` in settings). A change reloads the plugin.

| Option | Default | What it does |
| --- | --- | --- |
| `selectMode` | `multi` | `multi`: number keys toggle, `9` fills all picks. `single`: a number key fills that one suggestion (the original behaviour) |
| `maxSuggestions` | `5` | How many suggestions, 1–8 (`9` and `0` are taken; at 8, **all** is click-only) |
| `labelChars` | `120` | Longest button label, 20–300 |
| `promptChars` | `1500` | Longest suggested prompt, 200–4000 |
| `previewChars` | `0` | How much of each full prompt to preview under its label, e.g. `240`; `0` hides it |
| `promptStyle` | `detailed` | `detailed`: 1–3 sentences with scope and what done looks like. `brief`: one short sentence |
| `combineHeader` | `Do these in order:` | Line above the numbered list when several are picked; empty for none |
| `extraInstructions` | (empty) | Your own guidance for the suggester, e.g. `write prompts in Thai` |
| `ghostText` | `true` | Also show the top suggestion as Tab-to-take ghost text in the box |
| `suggestSkills` | `true` | Tell the suggester which skills and slash commands the session has |
| `minAnswerChars` | `80` | Skip suggestions after answers shorter than this |

## License

MIT, as the original.
