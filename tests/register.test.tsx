import { expect, test } from 'claude-code/testing'
import type { Engine } from 'claude-code/testing'
import type { On } from 'claude-code'

const BAND = {
  plugin: 'next-steps-plus',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 30,
    bodyColumns: 100,
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

const REPLY = JSON.stringify([
  { label: 'Run the tests', prompt: 'Run the unit tests in tests/ and fix any failure.' },
  { label: 'Commit', prompt: 'Commit the change with a short message.' },
  { label: 'Review', prompt: '/code-review high' },
])

// Most tests are written against the original next-steps' behaviour: one
// press picks one, 3 suggestions, 8 selects all, the old header. They say
// so here, so a change of the plugin's defaults does not change them.
const BASE = { selectMode: 'single', maxSuggestions: 3, eightPicks: 'all', combineHeader: 'Do these in order:' } as const
const BASELINE = { options: BASE } as const
const MULTI = { options: { ...BASE, selectMode: 'multi' } } as const

// What the fork was asked, and the ghost text offered, by the last offer().
let asked = ''
let ghost = ''

// Stand in for the engine, finish one turn, and return what reached the box.
async function offer($: Engine, on: On, reply = REPLY): Promise<string[]> {
  const filled: string[] = []
  on('command.list', () => ({ value: [{ name: 'code-review', description: 'review', source: 'plugin' }] }))
  on('model.fork', (_, e) => {
    asked = e.prompt
    return { value: { isAnswered: true, text: reply, usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } }
  })
  on('prompt.suggest', (_, e) => ((ghost = e.text), { isShown: true }))
  on('prompt.fill', (_, e) => (filled.push(e.text), { isFilled: true }))
  on('turn.complete', (_, e) => ({ text: e.answer }))
  // The engine's own band, drawn beneath the plugin's.
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
  await $.turn.complete({
    reason: 'answer',
    answer: 'x'.repeat(200),
    durationMs: 1,
    isAborted: false,
    turnId: 't1',
  } as never)
  for (let i = 0; i < 20; i++) await Promise.resolve()
  return filled
}

test('multi: picks combine in pick order; 9 fills them', MULTI, async ($, on) => {
  const filled = await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', text: /Run the tests/ }))?.text).toContain('[ ]')
  await ui.press({ key: 's1' })
  await ui.press({ key: 's0' })
  expect((await ui.find({ type: 'Button', text: /use selected/ }))?.text).toContain('(2)')
  await ui.press({ key: 'use selected (2)' })
  expect(filled).toEqual([
    'Do these in order:\n1. Commit the change with a short message.\n2. Run the unit tests in tests/ and fix any failure.',
  ])
  await ui.unmount()
})

test('multi: a slash command clears the other picks', MULTI, async ($, on) => {
  const filled = await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 's0' })
  await ui.press({ key: 's2' })
  await ui.press({ key: 'use selected (1)' })
  expect(filled).toEqual(['/code-review high'])
  await ui.unmount()
})

test('display label+prompt shows each full prompt under its label', { options: { ...BASE, display: 'label+prompt' } }, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('Run the tests')
  expect((await ui.find({ type: 'Text', text: /fix any failure/ }))?.text).toBe(
    'Run the unit tests in tests/ and fix any failure.',
  )
  await ui.unmount()
})

test('display label (the default) shows labels only', BASELINE, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('Run the tests')
  expect(await ui.find({ type: 'Text', text: /fix any failure/ })).toBeUndefined()
  expect(asked).toContain('"label"')
  await ui.unmount()
})

test('option mode up-to (the default) asks for only what matters', BASELINE, async ($, on) => {
  await offer($, on)
  expect(asked).toContain('as up to 3 concrete prompts')
  expect(asked).toContain('never pad the list')
})

test('option mode exactly asks to fill every slot', { options: { ...BASE, optionMode: 'exactly', maxSuggestions: 4 } }, async ($, on) => {
  await offer($, on)
  expect(asked).toContain('as exactly 4 concrete prompts')
  expect(asked).not.toContain('never pad')
})

test('a wait answer shows what to wait for, with nothing to pick', BASELINE, async ($, on) => {
  await offer($, on, JSON.stringify([{ wait: 'Wait for the CI run to finish' }]))
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /nothing to do/ }))?.text).toBe('next: nothing to do now, wait for the CI run to finish')
  expect(await ui.find({ type: 'Button', key: 's0' })).toBeUndefined()
  expect(asked).toContain('"wait"')
  await ui.press({ key: 'dismiss' })
  expect(await ui.find({ type: 'Text', text: /nothing to do/ })).toBeUndefined()
  await ui.unmount()
})

test('prompts win over a wait in the same answer', BASELINE, async ($, on) => {
  await offer($, on, JSON.stringify([{ wait: 'the deploy' }, { prompt: 'Check the deploy logs.' }]))
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('Check the deploy logs.')
  expect(await ui.find({ type: 'Text', text: /nothing to do/ })).toBeUndefined()
  await ui.unmount()
})

const MARKED = JSON.stringify([
  { label: 'Run the tests', prompt: 'Run the unit tests.' },
  { label: 'Commit', prompt: 'Commit the change.', recommended: true },
])

test('a recommended step is marked, and ghost text offers it', BASELINE, async ($, on) => {
  await offer($, on, MARKED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('Run the tests')
  expect((await ui.find({ type: 'Button', key: 's1' }))?.text).toBe('Commit (Recommended)')
  expect(ghost).toBe('Commit the change.')
  expect(asked).toContain('"recommended": true')
  await ui.unmount()
})

test('markRecommended off shows no mark and asks for none', { options: { ...BASE, markRecommended: false } }, async ($, on) => {
  await offer($, on, MARKED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's1' }))?.text).toBe('Commit')
  expect(asked).not.toContain('recommended')
  expect(ghost).toBe('Run the unit tests.')
  await ui.unmount()
})

test('display prompt shows the prompt itself and asks for no labels', { options: { ...BASE, display: 'prompt' } }, async ($, on) => {
  const filled = await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('Run the unit tests in tests/ and fix any failure.')
  expect(asked).not.toContain('"label"')
  await ui.press({ key: 's0' })
  expect(filled).toEqual(['Run the unit tests in tests/ and fix any failure.'])
  await ui.unmount()
})

test('suggestions that do not fit the band are left off', { options: { ...BASE, display: 'prompt' } }, async ($, on) => {
  await offer($, on)
  // Five rows: three for the hint and keys, two for suggestions of one row each.
  const ui = await $.ui.mount({ ...BAND, props: { ...BAND.props, maxRows: 5 }, surface: 'terminal' })
  expect(await ui.find({ type: 'Button', key: 's1' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 's2' })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /did not fit/ }))?.text).toBe('1 more did not fit')
  expect((await ui.find({ type: 'Text', text: /type 1-2/ }))?.text).toBeDefined()
  await ui.unmount()
})

test('single: a press fills that prompt at once', BASELINE, async ($, on) => {
  const filled = await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /type 1-3/ }))?.text).toContain('0 to dismiss')
  await ui.press({ key: 's1' })
  expect(filled).toEqual(['Commit the change with a short message.'])
  await ui.unmount()
})

test('multi: 8 picks every prose suggestion, never a command', MULTI, async ($, on) => {
  const filled = await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 's2' })
  await ui.press({ key: 'all' })
  expect((await ui.find({ type: 'Button', text: /use selected/ }))?.text).toContain('(2)')
  await ui.press({ key: 'use selected (2)' })
  expect(filled).toEqual([
    'Do these in order:\n1. Run the unit tests in tests/ and fix any failure.\n2. Commit the change with a short message.',
  ])
  await ui.unmount()
})

test('multi: pressing all again clears the picks', MULTI, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  await ui.press({ key: 'all' })
  await ui.press({ key: 'all' })
  expect(await ui.find({ type: 'Button', text: /use selected/ })).toBeUndefined()
  await ui.unmount()
})

test('8 is always the key for all but commands', { options: { ...BASE, selectMode: 'multi', maxSuggestions: 8 } }, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Button', key: 'all' })).toBeDefined()
  expect(asked).toContain('up to 7 concrete prompts')
  await ui.unmount()
})

test('eightPicks recommended: 8 picks the recommended suggestions', { options: { ...BASE, selectMode: 'multi', eightPicks: 'recommended' } }, async ($, on) => {
  const filled = await offer($, on, MARKED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'all' }))?.text).toBe('select recommended')
  await ui.press({ key: 'all' })
  await ui.press({ key: 'use selected (1)' })
  expect(filled).toEqual(['Commit the change.'])
  await ui.unmount()
})

test('Tab takes the picks: the ghost text follows what is picked', MULTI, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(ghost).toBe('Run the unit tests in tests/ and fix any failure.')
  await ui.press({ key: 's1' })
  expect(ghost).toBe('Commit the change with a short message.')
  await ui.press({ key: 's0' })
  expect(ghost).toBe('Do these in order:\n1. Commit the change with a short message.\n2. Run the unit tests in tests/ and fix any failure.')
  await ui.press({ key: 's1' })
  await ui.press({ key: 's0' })
  expect(ghost).toBe('Run the unit tests in tests/ and fix any failure.')
  expect((await ui.find({ type: 'Text', text: /^next:/ }))?.text).toBe('next: type numbers to pick, Tab or 9 to use them, 0 to dismiss')
  await ui.press({ key: 's0' })
  expect((await ui.find({ type: 'Text', text: /^Tab\/$/ }))?.text).toBe('Tab/')
  await ui.unmount()
})

test("the hint leaves Tab out when the plugin's ghost text is off", { options: { ...BASE, selectMode: 'multi', ghostText: false } }, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /^next:/ }))?.text).toBe('next: type numbers to pick, 9 to use them, 0 to dismiss')
  await ui.press({ key: 's0' })
  expect(await ui.find({ type: 'Text', text: /^Tab\/$/ })).toBeUndefined()
  await ui.unmount()
})

test('8 reads "select all" when there is no command to leave out', { options: { ...BASE, selectMode: 'multi' } }, async ($, on) => {
  await offer($, on, MARKED)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'all' }))?.text).toBe('select all')
  await ui.unmount()
})

test('8 reads "select all except commands" when a command is listed', MULTI, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'all' }))?.text).toBe('select all except commands')
  await ui.unmount()
})

test('the defaults: multi, 5 suggestions, 8 selects recommended, "Do these tasks:"', async ($, on) => {
  await offer($, on, JSON.stringify([
    { label: 'One', prompt: 'Do one.' },
    { label: 'Two', prompt: 'Do two.', recommended: true },
    { label: 'Three', prompt: 'Do three.' },
    { label: 'Four', prompt: 'Do four.' },
    { label: 'Five', prompt: 'Do five.' },
    { label: 'Six', prompt: 'Do six.' },
  ]))
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /^next:/ }))?.text).toBe('next: type numbers to pick, Tab or 9 to use them, 0 to dismiss')
  expect(await ui.find({ type: 'Button', key: 's4' })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 's5' })).toBeUndefined()
  expect((await ui.find({ type: 'Button', key: 'all' }))?.text).toBe('select recommended')
  await ui.press({ key: 's0' })
  await ui.press({ key: 's2' })
  expect(ghost).toBe('Do these tasks:\n1. Do one.\n2. Do three.')
  expect(asked).toContain('up to 5 concrete prompts')
  await ui.unmount()
})

test('on desktop the list says to click, not to type keys', MULTI, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  expect((await ui.find({ type: 'Text', text: /^next:/ }))?.text).toBe('next: click to pick, then "use selected"')
  await ui.unmount()
})

test('the model is told there can be more than one recommended step', BASELINE, async ($, on) => {
  await offer($, on)
  expect(asked).toContain('There can be more than one')
})

test('several recommended steps are all marked, and 8 selects them all', { options: { ...BASE, selectMode: 'multi', eightPicks: 'recommended' } }, async ($, on) => {
  const filled = await offer($, on, JSON.stringify([
    { label: 'Run the tests', prompt: 'Run the tests.', recommended: true },
    { label: 'Update docs', prompt: 'Update the docs.' },
    { label: 'Commit', prompt: 'Commit.', recommended: true },
  ]))
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 's0' }))?.text).toBe('[ ] Run the tests (Recommended)')
  expect((await ui.find({ type: 'Button', key: 's2' }))?.text).toBe('[ ] Commit (Recommended)')
  await ui.press({ key: 'all' })
  await ui.press({ key: 'use selected (2)' })
  expect(filled).toEqual(['Do these in order:\n1. Run the tests.\n2. Commit.'])
  await ui.unmount()
})
