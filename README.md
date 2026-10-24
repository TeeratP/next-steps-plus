# next-steps-plus

After each answer, Claude Code suggests what you might ask next, shown above the prompt box. Tick the ones you want with the number keys, then press Tab or `9`: they go into the prompt box (one as it is, several as a numbered list) for you to edit and send. The plugin never sends a prompt on its own.

```
next: type numbers to pick, Tab or 9 to use them, 0 to dismiss
  1: [ ] run the tests you just wrote
  2: [1] commit the change (Recommended)
  3: [ ] do the same for the settings page
  4: [ ] /code-review high (runs alone)
  5: [ ] update the README
  8: select recommended   Tab/9: use selected (1)   0: dismiss
```

When the right move is to wait (CI, a build, a deploy, someone's reply) and there's nothing useful to type meanwhile, it says so instead, with nothing to pick:

```
next: nothing to do now, wait for the CI run to finish   0: dismiss
```

It's a fork of the original [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) plugin, which offers 3 suggestions and puts one in the prompt box with a single press. To work exactly like that, set `selectMode` to `single` and `maxSuggestions` to `3`. Everything else is in the [settings](#settings): longer suggestions, seeing each full prompt before you pick (or using it as the label), and more.

## Highlights

- **Pick several, send one prompt.** Tick suggestions with the number keys; they're written as one numbered draft in the order you ticked them.
- **Tab takes your picks.** The faint ghost text in the prompt box follows what you tick, so Claude Code's own Tab accepts exactly your selection: the recommended step with nothing ticked, that one with one ticked, the numbered draft with several.
- **(Recommended) marks the steps worth doing now** (one or several), the way Claude's own multiple-choice questions do, and `8` selects them all in one press.
- **Only what matters.** You get the steps that clearly matter, from none to 5, not a padded list. When the move is to wait for CI, a build or someone's reply, it says so instead of inventing work.
- **Knows your skills and slash commands.** A suggestion can be `/skill arguments` for the skills and commands you actually have; one naming a command you don't have is dropped. A command is never mixed into a list with other steps, since anything after it would become its arguments.
- **See what you'll get.** Show a short label, the label with its full prompt under it, or the full prompt itself as the label, so what you pick is exactly what lands in the box.
- **A settings pane with a live preview.** `/next-steps-plus` lists every setting with its full description, checks numbers as you type them, and shows a preview of the suggestion list (and the ghost text) as your settings draw it.
- **Cheap and out of the way.** Suggestions come from one quick question to a fork of your session, which reuses its prompt cache (about the cost of one short reply), asked after the answer is done so nothing waits on it. Suggestions that don't fit the space above the prompt box are left off, with a count.
- **Safe.** Suggestion text is cleaned of terminal escape codes and invisible characters before it's shown or written, and the plugin never sends a prompt on its own.
- **Your settings survive updates,** including settings that were renamed in a later version.

## Where it works

| | Terminal | Desktop app | VS Code | Mobile |
| --- | --- | --- | --- | --- |
| Suggestion list above the prompt box | ✓ | – (not shown) | – | – |
| `/next-steps-plus` settings pane | ✓ | not tested yet | not tested yet | not tested yet (numbers with − and +; text in `/config`) |

**The suggestion list works in the terminal (the Claude Code CLI).** It doesn't show in the desktop app, and Claude Code doesn't draw that space in VS Code or on mobile. The settings pane is built for every surface, but so far it's only been tested in the terminal.

## What it costs

Each suggestion list is one short extra request to the model: a quick question to a fork of your session that reuses its prompt cache, so it costs about one short reply, not a full new conversation. It's asked only after answers of at least 80 characters (`minAnswerChars`), and never while Claude is still working.

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

This is the default (`selectMode: multi`). Each number key ticks or unticks a suggestion, and `9` (or Tab, see below) puts all the ticked ones in the prompt box together:

```
next: type numbers to pick, Tab or 9 to use them, 0 to dismiss
  1: [2] Run the tests and fix failures
  2: [ ] Update the README for the new option
  3: [1] Commit the change
  4: [ ] /code-review high (runs alone)
  8: select all except commands   Tab/9: use selected (2)   0: dismiss
```

The number in brackets is the order you ticked them in, and that is the order they are written in. Here, pressing `3`, then `1`, then `9` writes:

```
Do these tasks:
1. Commit the change with a short message describing the new option.
2. Run the unit tests in tests/ and fix any failure, then re-run until green.
```

- `8` ticks the suggestions marked (Recommended) (or, with `eightPicks: all`, every suggestion except slash commands); press it again to untick them. (That's why there are at most 7 suggestions.)
- **Tab** works like `9`: the faint ghost text in the empty prompt box always follows your ticks (the recommended suggestion with nothing ticked, that one with one ticked, the numbered draft with several), so Claude Code's own Tab takes exactly that. It needs the plugin's `ghostText` setting on; with it off, the list says only `9`.
- A slash command (`/code-review high`) can only be used on its own, because anything after it would be read as its arguments. Ticking it unticks the others, and ticking anything else unticks it.

## Settings

Change them on the install screen, in `/config`, or in the plugin's own settings pane: type `/next-steps-plus`. A change takes effect right away, and all three show and change the same values.

The settings pane has three parts: every setting with its value on top; the selected setting in the middle (its description, current value, default, and where to change it); and at the bottom a preview of the suggestion list as your settings draw it, using sample suggestions.

```
──────────────────────────────────────────────────────────────
Settings
  Selection mode                     multi
  Key 8 picks                        recommended
▸ Max suggestions                    5
  Option mode                        up-to
  Label length                       48
  …
──────────────────────────────────────────────────────────────
Max suggestions
Show at most this many suggestions (1-7; in multi mode 8 picks
all, 9 uses the picks, 0 dismisses). Option mode decides
whether the list may be shorter.
Now: 5 · Default: 5 (the original next-steps used 3)

Enter: edit in the box below
                  ╭──────────────────╮
Max suggestions:  │ 5                │
                  ╰──────────────────╯
──────────────────────────────────────────────────────────────
Preview (sample suggestions with your settings; up-to often shows fewer)

next: type numbers to pick, Tab or 9 to use them, 0 to dismiss
  1: [ ] Run the tests
  2: [ ] Commit the change (Recommended)
  3: [ ] Review the diff (runs alone)
  4: [ ] Update the README
  5: [ ] Open a pull request
  8: select recommended   Tab/9: use selected   0: dismiss

╭──────────────────────────────────────────────────────────╮
│ > Commit the change with a short message describing it.  │
╰──────────────────────────────────────────────────────────╯
  ↑ your prompt box: faint ghost text, Tab accepts it

↑↓ move · Enter change · Esc close
```

- ↑↓ (or Tab) moves between settings.
- Enter turns a switch on or off, or steps a choice to its next option. For a number or text, Enter puts the cursor in the box below: type the value and press Enter to save.
- Numbers are checked before they're saved: a value that isn't a whole number in the setting's range (Max suggestions: 1–7) stays in the box with the reason in red, and nothing changes.
- On a choice, a digit picks an option directly (`1: label  2: label+prompt  3: prompt`); ✓ marks the current one.
- After each change the pane keeps the keyboard and stays on the same setting.
- While the cursor is in a box, the box is framed in the accent colour and the setting's row in the list says `editing below ↓`; it shows the value again once you save or move back up.
- Esc in a box goes back to the list without saving; Esc on the list closes the pane.
- The preview at the bottom changes as soon as you change a setting.
- If the pane opens while the prompt box has text, your keys stay in the prompt (the pane says so at the bottom). Press ctrl+x, then Tab, to move them to the pane; Esc hands them back.

The pane opens beside the conversation in a wide terminal, or above the prompt otherwise. Long values are shortened with … in the list; the full value shows below as Now.

| Setting | Default | What it does |
| --- | --- | --- |
| `selectMode` | `multi` (original: `single`) | `multi`: pick several, as [above](#picking-several-suggestions). `single`: a number key puts that one suggestion in the prompt box |
| `eightPicks` | `recommended` | `multi` only: what `8` picks. `recommended`: the suggestions marked (Recommended). `all`: every suggestion except slash commands |
| `maxSuggestions` | `5` (original: `3`) | The most suggestions to show, 1–7 (in multi mode `8` picks all, `9` uses the picks, `0` dismisses) |
| `optionMode` | `up-to` | How many options to list. `up-to`: only the next steps that clearly matter, from none up to `maxSuggestions`, with no filler; you may see just one. `exactly`: always fill every slot |
| `labelChars` | `48`\* | Longest suggestion label, 20–300 characters |
| `promptChars` | `600`\* | Longest suggested prompt, 200–4000 characters |
| `display` | `label`\* | What each suggestion shows. `label`: a short label. `label+prompt`: the label, with its full prompt dimmed under it. `prompt`: the full prompt itself, so you see exactly what you pick (the model then writes no labels). Long prompts take more rows; any that don't fit are left off the end |
| `promptStyle` | `standard`\* | How long the suggested prompts are. `standard`: no guidance. `detailed`: 1–3 sentences saying what to do, where, and what done looks like. `brief`: one short sentence. With `display: prompt`, `standard` or `brief` fits more suggestions |
| `combineHeader` | `Do these tasks:` | `multi` only: the line above the list when several are picked; leave empty for none |
| `extraInstructions` | none | Your own wishes for the suggestions, e.g. `write prompts in Thai` |
| `ghostText` | on\* | Also show the top suggestion as faint text in the empty prompt box; Tab takes it (in multi mode, it follows your picks) |
| `markRecommended` | on | Put (Recommended) after each step the model would advise now (there can be more than one); ghost text offers the first, and `8` can select them all |
| `suggestSkills` | on\* | Let suggestions be your skills and slash commands |
| `minAnswerChars` | `80`\* | No suggestions after answers shorter than this many characters |

\* Same as the original next-steps. Settings marked "original:" exist in the original with a different default; the rest are new in this plugin.

## Credits

A fork of [next-steps](https://github.com/anthropics/claude-plugins-community/tree/main/next-steps) by Thariq Shihipar (MIT), from [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community) at commit `f60f045`. The way suggestions are made is the original's; this plugin adds the settings and multi-select.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT, as the original.
