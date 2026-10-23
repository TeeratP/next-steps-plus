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

const MULTI = { options: { selectMode: 'multi' } } as const

// Stand in for the engine, finish one turn, and return what reached the box.
async function offer($: Engine, on: On): Promise<string[]> {
  const filled: string[] = []
  on('command.list', () => ({ value: [{ name: 'code-review', description: 'review', source: 'plugin' }] }))
  on('model.fork', () => ({ value: { isAnswered: true, text: REPLY, usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } } }))
  on('prompt.suggest', () => ({ isShown: true }))
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

test('previewFlag shows each full prompt under its label', { options: { previewFlag: true } }, async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /fix any failure/ }))?.text).toBe(
    'Run the unit tests in tests/ and fix any failure.',
  )
  await ui.unmount()
})

test('preview is off by default', async ($, on) => {
  await offer($, on)
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /fix any failure/ })).toBeUndefined()
  await ui.unmount()
})

test('default (single, as the original): a press fills that prompt at once', async ($, on) => {
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
