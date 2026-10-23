# Changelog

### Unreleased

- The model may mark more than one step (Recommended): every step that clearly should be done now, not just one.

### v0.2.0

The first stable release: setting names are fixed from here on.


- Works sensibly on every surface: the settings pane uses click or tap wording outside the terminal, mobile gets − and + buttons for numbers (it has no text box), and text settings on mobile point to `/config`. The suggestion list and the preview say "click" on the desktop app.
- Separator lines in the settings pane never wrap, whatever the font.
- New icon (NS⁺), and `homepage` / `repository` in the plugin manifest.
- README: where it works on each surface, and what it costs.

### v0.1.21

- New defaults: `selectMode: multi`, `eightPicks: recommended`, `maxSuggestions: 5`, `combineHeader: "Do these tasks:"`. Settings you saved yourself are kept. For the original behaviour, set `selectMode: single` and `maxSuggestions: 3`.

### v0.1.20

- The 8 key says what it does: `8: select all except commands` (or `select all` when no command is listed) and `8: select recommended`.
- Correction: Claude Code's `promptSuggestionEnabled` does not affect the plugin's ghost text, so the list shows `Tab or 9` / `Tab/9` whenever the plugin's `ghostText` is on, and the preview no longer says the ghost text is blocked. (v0.1.18 and v0.1.19 wrongly said it needed that setting.)

### v0.1.19

- New `eightPicks` setting: in multi mode, `8` picks every suggestion except slash commands (`all`, the default) or the ones marked (Recommended) (`recommended`).
- Tab uses your picks like `9`: the ghost text in the empty prompt box follows what you tick, so Claude Code's Tab takes it. The list shows `Tab or 9` / `Tab/9: use selected` when ghost text can show, else just `9`.

### v0.1.18

- Fix: a line in the settings pane (for example a preview suggestion) could vanish when its part was one line too full; now what doesn't fit is cut at the bottom instead.
- Preview: with ghost text on, the prompt-box picture always shows the faint text; if Claude Code's `promptSuggestionEnabled` is false, the caption says it won't actually appear until that's on.

### v0.1.17

- Settings pane: a setting's row says `editing below ↓` while the cursor is in its box.
- Esc in a box goes back to the list instead of closing the pane; the hint under the box says so.
- A preview at the bottom of the pane shows the suggestion list as your settings draw it.
- While you type, the box is framed in the accent colour with a bold "▶ Type …" line over it, and the row's `editing below ↓` is in the same colour, so the cursor is easy to find.
- The three parts (settings, the selected setting, the preview) share the pane's height equally, whatever room it has; in a short pane the settings list scrolls with the selection (`↑ n more` / `↓ n more`), and a preview too long for its part ends with "… n more lines".
- The setting's name is outside the box, to its left; the box holds only the value.
- Each part opens with a plain line, its title (Settings, the setting's name, Preview) on the row under it.
- Under the preview, a small picture of your prompt box shows the faint ghost text (grey italics), or an empty box with the reason it's off (the `ghostText` setting, or Claude Code's `promptSuggestionEnabled` set to false).
- Max suggestions is now 1–7, since `8` is the key for picking all; a saved 8 is read as 7.

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
