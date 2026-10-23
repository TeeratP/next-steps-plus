import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { ConfigRow, On } from 'claude-code'

const PANE_ID = 'next-steps-plus-settings'

function pane(bodyColumns: number, isFocused = true, bodyRows = 50) {
  return {
    plugin: 'next-steps-plus',
    component: 'Pane',
    requestId: PANE_ID,
    props: {
      title: 'next-steps-plus settings',
      isFocused,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows },
      view: {},
    },
  } as const
}

const provider = { plugin: 'next-steps-plus', tier: 'user' } as const

function row(field: string, label: string, kind: ConfigRow['kind'], value: ConfigRow['value'], description: string, options?: string[]): ConfigRow {
  return { key: `next-steps-plus.${field}`, label, kind, value, description, provider, isLocked: false, ...(options ? { options } : {}) }
}

const ROWS: ConfigRow[] = [
  row('selectMode', 'Selection mode (default: single)', 'choice', 'single', 'single: one press fills one. multi: pick several.', ['multi', 'single']),
  row('labelChars', 'Label length (default: 48)', 'number', 48, 'Longest button label, in characters (20-300).'),
  row('ghostText', 'Tab ghost text (default: on)', 'boolean', true, 'Also offer the top suggestion as ghost text.'),
  row('extraInstructions', 'Extra instructions (default: none)', 'text', '', 'Your own preferences for the suggestions.'),
]

// How often the pane asked to be opened (and given the keys) again.
let reopened = 0

// Stand in for the engine's settings; returns the changes the pane made.
function settings(on: On): Array<[string, ConfigRow['value']]> {
  const sets: Array<[string, ConfigRow['value']]> = []
  reopened = 0
  on('config.list', () => ({ value: ROWS }))
  on('config.set', (_, e) => (sets.push([e.key, e.value]), { value: e.value }))
  on('ui.open', () => ((reopened += 1), { value: { isPlaced: true } }))
  // A person's move is the event (answered with its result); the plugin's
  // own $.ui.focus is a call on $ (answered with { value }).
  on('ui.focus', (_, e) => (e.origin.kind === 'person' ? {} : ({ value: {} } as never)))
  return sets
}

async function focus($: Engine, element: string) {
  await $.ui.focus({ component: 'Pane', requestId: PANE_ID, plugin: 'next-steps-plus', element, origin: { kind: 'person' } })
}

test('shows the selected setting in full on the right', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /one press fills one/ }))?.text).toContain('multi: pick several.')
  expect((await ui.find({ type: 'Text', text: /Default:/ }))?.text).toBe('Now: single · Default: single (same as the original next-steps)')
  await ui.unmount()
})

test('moving the focus selects that row', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await focus($, 'extraInstructions')
  expect((await ui.find({ type: 'Text', text: /Your own preferences/ }))?.text).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /Default:/ }))?.text).toBe('Now: (none) · Default: none (new in next-steps-plus)')
  await ui.unmount()
})

test('Enter flips a switch and steps a choice; a number opens its box', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'ghostText' })
  await ui.press({ key: 'selectMode' })
  await ui.press({ key: 'labelChars' })
  expect(sets).toEqual([
    ['next-steps-plus.ghostText', false],
    ['next-steps-plus.selectMode', 'multi'],
  ])
  expect(await ui.find({ type: 'Input', key: 'edit' })).toBeDefined()
  await ui.unmount()
})

test('a digit picks a choice, and the pane takes the keys back', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'pick-single' }))?.text).toBe('single ✓')
  await ui.press({ key: 'pick-multi' })
  expect(sets).toEqual([['next-steps-plus.selectMode', 'multi']])
  expect(reopened).toBe(1)
  await ui.unmount()
})

test('a number row has no list to pick from, only its box', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await focus($, 'labelChars')
  expect(await ui.find({ type: 'Button', key: 'pick-60' })).toBeUndefined()
  expect(await ui.find({ type: 'Input', key: 'edit' })).toBeDefined()
  await ui.unmount()
})

test('a typed number is checked: refused ones are not saved and say why', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'labelChars' })
  await ui.input({ key: 'edit', text: 'abc' })
  expect((await ui.find({ type: 'Text', text: /was not saved/ }))?.text).toBe(
    'Label length takes a whole number from 20 to 300; "abc" was not saved.',
  )
  await ui.input({ key: 'edit', text: '5000' })
  await ui.input({ key: 'edit', text: '12.5' })
  expect(sets).toEqual([])
  await ui.input({ key: 'edit', text: ' 80 ' })
  expect(sets).toEqual([['next-steps-plus.labelChars', 80]])
  expect(await ui.find({ type: 'Text', text: /was not saved/ })).toBeUndefined()
  await ui.unmount()
})

test('a long value is cut in the list and shown whole below', async ($, on) => {
  settings(on)
  ROWS[3] = row('extraInstructions', 'Extra instructions (default: none)', 'text', 'Do these, you prioritize and order them optimally', 'Your own preferences for the suggestions.')
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'extraInstructions' }))?.text).toContain('Do these, you prioritiz…')
  await focus($, 'extraInstructions')
  expect((await ui.find({ type: 'Text', text: /^Now:/ }))?.text).toBe('Now: Do these, you prioritize and order them optimally · Default: none (new in next-steps-plus)')
  ROWS[3] = row('extraInstructions', 'Extra instructions (default: none)', 'text', '', 'Your own preferences for the suggestions.')
  await ui.unmount()
})

test('without the keyboard, the pane says how to take it', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96, false), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /ctrl\+x then Tab/ }))?.text).toContain('Esc gives them back')
  await ui.unmount()
  const focused = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await focused.find({ type: 'Text', text: /↑↓ move/ }))?.text).toBe('↑↓ move · Enter change · 1-2 pick · Esc close')
  await focused.unmount()
})

test('a narrow pane stacks the description under the list', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(50), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /one press fills one/ }))?.text).toBeDefined()
  await ui.unmount()
})

test('a text row is typed in the box below', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'extraInstructions' })
  await ui.input({ key: 'edit', text: 'write prompts in Thai' })
  expect(sets).toEqual([['next-steps-plus.extraInstructions', 'write prompts in Thai']])
  await ui.unmount()
})

test('a turn declares /next-steps-plus when the session start was missed', async ($, on) => {
  const declared: string[] = []
  on('command.register', (_, e) => (declared.push(e.name), { value: { command: e.name } }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  await $.turn.start({ text: 'hi', turnId: 't1' })
  await $.turn.start({ text: 'again', turnId: 't2' })
  expect(declared).toEqual(['next-steps-plus'])
})

// A turn with these saved options; returns what the plugin carried over.
async function carriedFrom($: Engine, on: On, options: Record<string, unknown>) {
  const sets = settings(on)
  on('settings.read', () => ({ value: { pluginConfigs: { 'next-steps-plus@next-steps-plus': { options } } } }))
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('turn.start', (_, e) => ({ turnId: e.turnId }))
  ROWS.push(row('optionMode', 'Option mode (default: up-to)', 'choice', 'up-to', '', ['up-to', 'exactly']))
  ROWS.push(row('display', 'Display (default: label)', 'choice', 'label', '', ['label', 'label+prompt', 'prompt']))
  await $.turn.start({ text: 'hi', turnId: 't1' })
  await $.turn.start({ text: 'again', turnId: 't2' })
  ROWS.splice(-2)
  return sets
}

test('a value saved under an old name is carried to the new one, once', async ($, on) => {
  const sets = await carriedFrom($, on, { countMode: 'exactly', previewFlag: true, maxSuggestions: 5 })
  expect(sets).toEqual([
    ['next-steps-plus.optionMode', 'exactly'],
    ['next-steps-plus.display', 'label+prompt'],
  ])
})

test('a value already saved under the new name is never overwritten', async ($, on) => {
  const sets = await carriedFrom($, on, { countMode: 'exactly', optionMode: 'up-to', previewFlag: true, display: 'prompt' })
  expect(sets).toEqual([])
})

const MARK = /editing below ↓/

test('the row says "editing below" while the cursor is in its box', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'labelChars' })
  expect((await ui.find({ type: 'Button', key: 'labelChars' }))?.text).toMatch(MARK)
  expect((await ui.find({ type: 'Text', text: /Esc: back to the list/ }))?.text).toBe(
    '▶ Type a whole number 20-300, then Enter to save · Esc: back to the list',
  )
  // Moving up to another row shows the value again.
  await focus($, 'selectMode')
  expect((await ui.find({ type: 'Button', key: 'labelChars' }))?.text).toContain('48')
  expect(await ui.find({ type: 'Button', text: MARK })).toBeUndefined()
  await ui.unmount()
})

test('saving from the box shows the value again', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'labelChars' })
  await ui.input({ key: 'edit', text: '80' })
  expect(sets).toEqual([['next-steps-plus.labelChars', 80]])
  expect(await ui.find({ type: 'Button', text: MARK })).toBeUndefined()
  await ui.unmount()
})

test('a refused number keeps the cursor in the box, still marked', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'labelChars' })
  await ui.input({ key: 'edit', text: 'abc' })
  expect((await ui.find({ type: 'Button', key: 'labelChars' }))?.text).toMatch(MARK)
  await ui.unmount()
})

test('the preview shows sample suggestions as your settings draw them', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /^next: type 1-3/ }))?.text).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /^ {2}2: / }))?.text).toBe('  2: Commit the change (Recommended)')
  expect(await ui.find({ type: 'Text', text: /^ {2}4: / })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /^> / }))?.text).toBe('> Commit the change with a short message describing it.')
  expect((await ui.find({ type: 'Text', text: /your prompt box/ }))?.text).toBe('  ↑ your prompt box: faint ghost text, Tab accepts it')
  await ui.unmount()
})

test('the preview follows multi-select and display settings', async ($, on) => {
  settings(on)
  const saved = [...ROWS]
  ROWS.push(row('display', 'Display (default: label)', 'choice', 'prompt', '', ['label', 'label+prompt', 'prompt']))
  ROWS[0] = row('selectMode', 'Selection mode (default: single)', 'choice', 'multi', '', ['multi', 'single'])
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /^ {2}3: / }))?.text).toBe('  3: [ ] /code-review high (runs alone)')
  expect((await ui.find({ type: 'Text', text: /^ {2}1: / }))?.text).toBe('  1: [ ] Run the unit tests in tests/ and fix any failure.')
  expect((await ui.find({ type: 'Text', text: /use selected/ }))?.text).toBe('  8: all except commands   Tab/9: use selected   0: dismiss')
  ROWS.splice(0, ROWS.length, ...saved)
  await ui.unmount()
})

test('the preview is cut to its section, saying how much it left out', async ($, on) => {
  settings(on)
  const saved = [...ROWS]
  ROWS.push(row('maxSuggestions', 'Max suggestions (default: 3)', 'number', 8, ''))
  ROWS.push(row('display', 'Display (default: label)', 'choice', 'label+prompt', '', ['label', 'label+prompt', 'prompt']))
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /more lines$/ }))?.text).toMatch(/^… \d+ more lines$/)
  ROWS.splice(0, ROWS.length, ...saved)
  await ui.unmount()
})

test('a short pane scrolls the list with the selection', async ($, on) => {
  settings(on)
  const saved = [...ROWS]
  ROWS.push(row('maxSuggestions', 'Max suggestions (default: 3)', 'number', 3, ''))
  ROWS.push(row('promptChars', 'Prompt length (default: 600)', 'number', 600, ''))
  ROWS.push(row('minAnswerChars', 'Shortest answer to suggest after (default: 80)', 'number', 80, ''))
  // 20 rows: a footer of 2, then three sections of 6; the list shows 3 rows.
  const ui = await $.ui.mount({ ...pane(96, true, 20), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /↓ \d+ more/ }))?.text).toMatch(/↓ \d+ more/)
  await focus($, 'minAnswerChars')
  expect(await ui.find({ type: 'Button', key: 'minAnswerChars' })).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /↑ \d+ more/ }))?.text).toMatch(/↑ \d+ more/)
  ROWS.splice(0, ROWS.length, ...saved)
  await ui.unmount()
})

test("the setting's name sits outside the box, left of it", async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await focus($, 'labelChars')
  expect((await ui.find({ type: 'Text', text: /^Label length: $/ }))?.text).toBe('Label length: ')
  expect((await ui.find({ type: 'Input', key: 'edit' }))?.text).toBe('48')
  await ui.unmount()
})

test('each section opens with a plain line, its title on the row under it', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(40), surface: 'terminal' })
  const lines = await ui.findAll({ type: 'Text', text: /^─+$/ })
  expect(lines.length).toBe(3)
  expect(lines[0]?.text).toBe('─'.repeat(40))
  expect((await ui.find({ type: 'Text', text: /^Settings$/ }))?.text).toBe('Settings')
  expect((await ui.find({ type: 'Text', text: /^Selection mode$/ }))?.text).toBe('Selection mode')
  expect((await ui.find({ type: 'Text', text: /^Preview / }))?.text).toBe(
    'Preview (sample suggestions with your settings; up-to often shows fewer)',
  )
  await ui.unmount()
})

test('with Claude Code prompt suggestions off, the box shows the faint text it would show, and why it does not', async ($, on) => {
  settings(on)
  on('settings.read', () => ({ value: { promptSuggestionEnabled: false } }))
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /your prompt box/ }))?.text).toBe(
    "  ↑ your prompt box would show this faint text, but promptSuggestionEnabled is false in your Claude Code settings, so it doesn't",
  )
  // The sample faint text is still drawn, so the person sees what it would be.
  expect((await ui.find({ type: 'Text', text: /^> / }))?.text).toBe('> Commit the change with a short message describing it.')
  await ui.unmount()
})

test("the ghost text line says off when the plugin's ghostText is off", async ($, on) => {
  settings(on)
  const saved = [...ROWS]
  ROWS[2] = row('ghostText', 'Tab ghost text (default: on)', 'boolean', false, '')
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /your prompt box/ }))?.text).toBe(
    '  ↑ your prompt box: no ghost text (the Tab ghost text setting is off)',
  )
  ROWS.splice(0, ROWS.length, ...saved)
  await ui.unmount()
})

test('max suggestions stops at 7: 8 is the key for all but commands', async ($, on) => {
  const sets = settings(on)
  const saved = [...ROWS]
  ROWS.push(row('maxSuggestions', 'Max suggestions (default: 3)', 'number', 8, ''))
  ROWS[0] = row('selectMode', 'Selection mode (default: single)', 'choice', 'multi', '', ['multi', 'single'])
  const ui = await $.ui.mount({ ...pane(96, true, 80), surface: 'terminal' })
  // A saved 8 is read as 7: the preview stops at 7, and 8 stays "all".
  expect((await ui.find({ type: 'Text', text: /^ {2}7: / }))?.text).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^ {2}8: \[/ })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /^ {2}8: all/ }))?.text).toBeDefined()
  await ui.press({ key: 'maxSuggestions' })
  await ui.input({ key: 'edit', text: '8' })
  expect((await ui.find({ type: 'Text', text: /was not saved/ }))?.text).toBe(
    'Max suggestions takes a whole number from 1 to 7; "8" was not saved.',
  )
  await ui.input({ key: 'edit', text: '7' })
  expect(sets).toEqual([['next-steps-plus.maxSuggestions', 7]])
  ROWS.splice(0, ROWS.length, ...saved)
  await ui.unmount()
})
