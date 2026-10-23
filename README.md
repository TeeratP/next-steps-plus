# next-steps-plus

After each answer, Claude Code suggests what you might ask next, shown above the prompt box. Type a number to put that suggestion in the prompt box, edit it if you like, and press Enter. The plugin never sends a prompt on its own.

```
next: type 1-3 to put one in the prompt box, 0 to dismiss
  1: run the tests you just wrote (Recommended)
  2: do the same for the settings page
  3: /code-review high
  0: dismiss
```

When the right move is to wait (CI, a build, a deploy, someone's reply) and there's nothing useful to type meanwhile, it says so instead, with nothing to pick:

```
next: nothing to do now, wait for the CI run to finish   0: dismiss
```

Out of the box it works like the original [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) plugin. What it adds is [settings](#settings): more and longer suggestions, seeing each full prompt before you pick (or using it as the label), and picking several suggestions at once.

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

To update later without restarting: run `claude plugin marketplace update next-steps-plus && claude plugin update next-steps-plus@next-steps-plus`, then `/reload-plugins`. Updates keep your settings, and a setting saved under an older name is carried over to its new name (it never replaces a value you already set).

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

Change them on the install screen, in `/config`, or in the plugin's own settings pane: type `/next-steps-plus`. A change takes effect right away, and all three show and change the same values.

The settings pane has three parts: every setting with its value on top; the selected setting in the middle (its description, current value, default, and where to change it); and at the bottom a preview of the suggestion list as your settings draw it, using sample suggestions.

```
──────────────────────────────────────────────────────────────
Settings
  Selection mode                     single
▸ Max suggestions                    3
  Option mode                        up-to
  Label length                       48
  Prompt length                      600
  Display                            label
  …
──────────────────────────────────────────────────────────────
Max suggestions
Show at most this many suggestions (1-8). Option mode decides
whether the list may be shorter.
Now: 3 · Default: 3 (same as the original next-steps)

Enter: edit in the box below
                  ╭──────────────────╮
Max suggestions:  │ 3                │
                  ╰──────────────────╯
──────────────────────────────────────────────────────────────
Preview (sample suggestions with your settings; up-to often shows fewer)

next: type 1-3 to put one in the prompt box, 0 to dismiss
  1: Run the tests
  2: Commit the change (Recommended)
  3: Review the diff
  0: dismiss
prompt box (Tab takes it): Commit the change with a short message describing it.

↑↓ move · Enter change · Esc close
```

- ↑↓ (or Tab) moves between settings.
- Enter turns a switch on or off, or steps a choice to its next option. For a number or text, Enter puts the cursor in the box below: type the value and press Enter to save.
- Numbers are checked before they're saved: a value that isn't a whole number in the setting's range (Max suggestions: 1–8) stays in the box with the reason in red, and nothing changes.
- On a choice, a digit picks an option directly (`1: label  2: label+prompt  3: prompt`); ✓ marks the current one.
- After each change the pane keeps the keyboard and stays on the same setting.
- While the cursor is in a box, the box is framed in the accent colour and the setting's row in the list says `editing below ↓`; it shows the value again once you save or move back up.
- Esc in a box goes back to the list without saving; Esc on the list closes the pane.
- The preview at the bottom changes as soon as you change a setting.
- If the pane opens while the prompt box has text, your keys stay in the prompt (the pane says so at the bottom). Press ctrl+x, then Tab, to move them to the pane; Esc hands them back.

The pane opens beside the conversation in a wide terminal, or above the prompt otherwise. Long values are shortened with … in the list; the full value shows below as Now.

| Setting | Default | What it does |
| --- | --- | --- |
| `selectMode` | `single`\* | `single`: a number key puts that one suggestion in the prompt box. `multi`: pick several, as [above](#picking-several-suggestions) |
| `maxSuggestions` | `3`\* | The most suggestions to show, 1–8 |
| `optionMode` | `up-to` | How many options to list. `up-to`: only the next steps that clearly matter, from none up to `maxSuggestions`, with no filler; you may see just one. `exactly`: always fill every slot |
| `labelChars` | `48`\* | Longest suggestion label, 20–300 characters |
| `promptChars` | `600`\* | Longest suggested prompt, 200–4000 characters |
| `display` | `label`\* | What each suggestion shows. `label`: a short label. `label+prompt`: the label, with its full prompt dimmed under it. `prompt`: the full prompt itself, so you see exactly what you pick (the model then writes no labels). Long prompts take more rows; any that don't fit are left off the end |
| `promptStyle` | `standard`\* | How long the suggested prompts are. `standard`: no guidance. `detailed`: 1–3 sentences saying what to do, where, and what done looks like. `brief`: one short sentence. With `display: prompt`, `standard` or `brief` fits more suggestions |
| `combineHeader` | `Do these in order:` | `multi` only: the line above the list when several are picked; leave empty for none |
| `extraInstructions` | none | Your own wishes for the suggestions, e.g. `write prompts in Thai` |
| `ghostText` | on\* | Also show the top suggestion as faint text in the empty prompt box; Tab takes it |
| `markRecommended` | on | Put (Recommended) after the step the model would most advise now, usually one; ghost text then offers that step |
| `suggestSkills` | on\* | Let suggestions be your skills and slash commands |
| `minAnswerChars` | `80`\* | No suggestions after answers shorter than this many characters |

\* Same as the original next-steps. Settings without \* are new in this plugin.

## Credits

A fork of [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) by Thariq Shihipar (MIT), from [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community) at commit `f60f045`. The way suggestions are made is the original's; this plugin adds the settings and multi-select.

## Changelog

### v0.1.17 (not released yet)

- Settings pane: a setting's row says `editing below ↓` while the cursor is in its box.
- Esc in a box goes back to the list instead of closing the pane; the hint under the box says so.
- A preview at the bottom of the pane shows the suggestion list as your settings draw it.
- The three parts (settings, the selected setting, the preview) have the same fixed height; a preview too long for its part ends with "… n more lines".
- While you type, the box is framed in the accent colour with a bold "▶ Type …" line over it, and the row's `editing below ↓` is in the same colour, so the cursor is easy to find.
- The three parts share the pane's height equally, whatever room it has; in a short pane the settings list scrolls with the selection (`↑ n more` / `↓ n more`).
- The setting's name is outside the box, to its left; the box holds only the value.
- Each part opens with a plain line, its title (Settings, the setting's name, Preview) on the row under it.

### v0.1.16

- Number settings are typed in a box, like text, instead of picked from a list. The value is checked first: anything that isn't a whole number in range is refused, with the reason shown in red in the pane, and nothing is saved.

### v0.1.15

- Settings pane: digits pick a value for the selected setting (with Max suggestions selected, `5` sets 5), so numbers no longer need typing or a dropdown. Enter steps to the next value.
- After a change the pane asks for the keyboard back and stays on the same setting. Before, a change could leave your keys in the main prompt until you reopened the pane.

### v0.1.14

- The step the model would most advise now is marked (Recommended) after its label, as in Claude's own multiple-choice questions; the Tab ghost text offers it. Turn off with `markRecommended`.
- The settings pane says when it doesn't have the keyboard (the prompt box had text when it opened) and how to give it: ctrl+x, then Tab.

### v0.1.13

- Settings saved under an old name (`countMode`, `previewFlag`, `previewChars`) are carried to their new name (`optionMode`, `display`) when the plugin loads, unless you already set the new one.

### v0.1.12

- Number settings are picked from a list of common values with ↑↓ and Enter, instead of typed. Your current value is always in the list.

### v0.1.11

- The settings pane puts the selected setting's description below the list, at full width, instead of beside it.
- Long values are shortened with … in the list, and the pane asks for enough height to show every setting.

### v0.1.10

- When the right move is to wait (CI, a build, a deploy, someone's reply), the list says what to wait for instead of suggesting prompts. If the model gives prompts too, the prompts are shown.

### v0.1.9

- `/next-steps-plus` now also works after updating mid-session with `/reload-plugins`: the command is added at the next turn instead of only when a session starts.

### v0.1.8

- `countMode` is renamed `optionMode` (shown as "Option mode"), and its description now explains both choices. If you set `countMode`, set `optionMode` instead.

### v0.1.7

- New `countMode` setting. `up-to` (default) lists only the next steps that clearly matter, so you may see fewer than `maxSuggestions`, or none; `exactly` always fills every slot. "Number of suggestions" is now "Max suggestions".

### v0.1.6

- `previewFlag` is replaced by `display`: `label` (default), `label+prompt` (what `previewFlag: on` did), or the new `prompt`, which shows the full prompt as the label. If you had `previewFlag` on, set `display` to `label+prompt`.
- Suggestions that would not fit the rows above the prompt box are left off the end, with a note saying how many.

### v0.1.5

- `/next-steps-plus` opens a settings pane that shows each setting's full description, current value and default beside the list.

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
