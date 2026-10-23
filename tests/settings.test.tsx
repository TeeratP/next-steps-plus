import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { ConfigRow, On } from 'claude-code'

const PANE_ID = 'next-steps-plus-settings'

function pane(bodyColumns: number) {
  return {
    plugin: 'next-steps-plus',
    component: 'Pane',
    requestId: PANE_ID,
    props: {
      title: 'next-steps-plus settings',
      isFocused: true,
      bodyColumns,
      placement: 'dock',
      scroll: { offset: 0, bodyRows: 30 },
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
  row('previewFlag', 'Show prompt preview (default: off)', 'boolean', false, 'Show each full prompt under its label.'),
  row('extraInstructions', 'Extra instructions (default: none)', 'text', '', 'Your own preferences for the suggestions.'),
]

// Stand in for the engine's settings; returns the changes the pane made.
function settings(on: On): Array<[string, ConfigRow['value']]> {
  const sets: Array<[string, ConfigRow['value']]> = []
  on('config.list', () => ({ value: ROWS }))
  on('config.set', (_, e) => (sets.push([e.key, e.value]), { value: e.value }))
  on('ui.focus', () => ({}))
  return sets
}

async function focus($: Engine, element: string) {
  await $.ui.focus({ component: 'Pane', requestId: PANE_ID, plugin: 'next-steps-plus', element, origin: { kind: 'person' } })
}

test('shows the selected setting in full on the right', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /one press fills one/ }))?.text).toContain('multi: pick several.')
  expect((await ui.find({ type: 'Text', text: /Default:/ }))?.text).toBe('Default: single (same as the original next-steps)')
  await ui.unmount()
})

test('moving the focus selects that row', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await focus($, 'extraInstructions')
  expect((await ui.find({ type: 'Text', text: /Your own preferences/ }))?.text).toBeDefined()
  expect((await ui.find({ type: 'Text', text: /Default:/ }))?.text).toBe('Default: none (new in next-steps-plus)')
  await ui.unmount()
})

test('Enter flips a switch and steps a choice', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'previewFlag' })
  await ui.press({ key: 'selectMode' })
  expect(sets).toEqual([
    ['next-steps-plus.previewFlag', true],
    ['next-steps-plus.selectMode', 'multi'],
  ])
  await ui.unmount()
})

test('a narrow pane stacks the description under the list', async ($, on) => {
  settings(on)
  const ui = await $.ui.mount({ ...pane(50), surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /one press fills one/ }))?.text).toBeDefined()
  await ui.unmount()
})

test('a number row is edited on the right and saved on Enter', async ($, on) => {
  const sets = settings(on)
  const ui = await $.ui.mount({ ...pane(96), surface: 'terminal' })
  await ui.press({ key: 'labelChars' })
  await ui.input({ key: 'edit', text: 'abc' })
  await ui.input({ key: 'edit', text: '80' })
  expect(sets).toEqual([['next-steps-plus.labelChars', 80]])
  await ui.unmount()
})
