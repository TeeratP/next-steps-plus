// The 45 s NS+ intro: problem first, the logo on the drop, the hero
// ("pick many, Tab once") with the most time, then what else NS+ adds, and
// an end card with the feature list, install line and logo. 120 BPM: scene
// changes and keypresses land on beats (15 frames). All timing lives in
// timing.json, which scripts/music.py reads too, so the music follows the cut.
import React from 'react'
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import {
  ACCENT, Camera, Caption, DIM, Keycap, LINE, Line, MINT, MONO, NSPlus, PANEL, PromptBox, Rec, Reel,
  SceneProps, TEXT, Terminal, UI, ramp, reelFrames,
} from './ui'
import timing from './timing.json'

const T = timing.intro

// 1. The problem: the original next-steps, one suggestion at a time.
const ProblemScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const [press] = T.keys.problem
  return (
    <AbsoluteFill>
      <Caption title="One suggestion at a time?" sub="the original next-steps" />
      <Camera len={len} from={1} to={1.05}>
        <Terminal height={520}>
          <Line dim>⏺ Done. Added the login form and its tests.</Line>
          <Line />
          <Line dim show={ramp(frame, len * 0.12)}>next: type 1-3 to put one in the prompt box, 0 to dismiss</Line>
          <Line show={ramp(frame, len * 0.18)} indent={28}>1: run the tests you just wrote</Line>
          <Line show={ramp(frame, len * 0.23)} indent={28}>2: commit the change</Line>
          <Line show={ramp(frame, len * 0.28)} indent={28}>3: /code-review high</Line>
          <PromptBox>{frame >= press + 4 ? 'run the tests you just wrote' : ''}</PromptBox>
        </Terminal>
      </Camera>
      <Keycap label="1" at={press} />
    </AbsoluteFill>
  )
}

// 2. NS+ crashes in on the drop: flash, logo slam, tagline.
const LogoScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 160 } })
  const flash = 1 - ramp(frame, 0, 10)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: UI }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${ACCENT}aa 0%, transparent 55%)`, opacity: flash }} />
      <Img
        src={staticFile('icon.png')}
        style={{ width: 320, height: 320, transform: `scale(${2.2 - 1.2 * s}) rotate(${(1 - s) * -8}deg)`, opacity: Math.min(1, s * 1.5) }}
      />
      <div style={{ marginTop: 44, fontSize: 70, fontWeight: 800, color: TEXT, opacity: ramp(frame, len * 0.2), letterSpacing: -1 }}>
        next-steps-plus
      </div>
      <div style={{ marginTop: 14, fontSize: 38, color: DIM, opacity: ramp(frame, len * 0.35) }}>
        Pick many. <span style={{ color: ACCENT, fontWeight: 700 }}>Tab once.</span>
      </div>
    </AbsoluteFill>
  )
}

// 3. The hero, part one: pick several; (Recommended); 8 selects them.
const PickScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const [eight, three] = T.keys.pick
  const picks: number[] = frame >= three + 3 ? [0, 1, 2] : frame >= eight + 3 ? [0, 1] : []
  const items = [
    { label: 'Run the tests and fix any failure', rec: true },
    { label: 'Commit the change', rec: true },
    { label: 'Update the README', rec: false },
    { label: '/code-review high', rec: false, alone: true },
    { label: 'Open a pull request', rec: false },
  ]
  return (
    <AbsoluteFill>
      <Caption title={<span><NSPlus />: pick several</span>} sub="(Recommended) marks what's worth doing · 8 selects them all" />
      <Camera len={len} from={1} to={1.14} x={0.4} y={0.62}>
        <Terminal>
          <Line dim>⏺ Done. Added the login form and its tests.</Line>
          <Line />
          <Line dim show={ramp(frame, len * 0.05)}>next: type numbers to pick, Tab or 9 to use them, 0 to dismiss</Line>
          {items.map((item, i) => {
            const order = picks.indexOf(i)
            const just = order !== -1 && (i < 2 ? frame - eight : frame - three) < 12
            return (
              <Line key={item.label} show={ramp(frame, len * 0.08 + i * 4)} indent={28}>
                <span>{i + 1}: </span>
                <span
                  style={{
                    color: order === -1 ? DIM : MINT, fontWeight: order === -1 ? 400 : 800,
                    textShadow: just ? `0 0 24px ${MINT}` : 'none',
                  }}
                >
                  {order === -1 ? '[ ]' : `[${order + 1}]`}
                </span>
                <span> {item.label}</span>
                {item.rec ? <Rec /> : null}
                {item.alone ? <span style={{ color: DIM }}> (runs alone)</span> : null}
              </Line>
            )
          })}
          <Line show={ramp(frame, len * 0.2)} indent={28}>
            <span style={{ color: ACCENT }}>8</span>: select recommended{'   '}
            <span style={{ color: ACCENT }}>Tab/9</span>: use selected{picks.length > 0 ? ` (${picks.length})` : ''}{'   '}
            <span style={{ color: ACCENT }}>0</span>: dismiss
          </Line>
        </Terminal>
      </Camera>
      <Keycap label="8" at={eight} />
      <Keycap label="3" at={three} />
    </AbsoluteFill>
  )
}

// 4. The hero, part two: Tab turns the picks into one numbered prompt.
const TabScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const [tab] = T.keys.tab
  const taken = frame >= tab + 3
  const draft = 'Do these tasks:\n1. Run the tests and fix any failure.\n2. Commit the change.\n3. Update the README.'
  return (
    <AbsoluteFill>
      <Caption title={taken ? 'Pick many. Tab once.' : 'Tab takes your picks'} at={taken ? tab + 3 : 4} sub="one numbered prompt, ready to edit and send" />
      <Camera len={len} from={1.02} to={1.16} x={0.5} y={0.72}>
        <Terminal>
          <Line dim>next: [1] Run the tests  [2] Commit the change  [3] Update the README</Line>
          <PromptBox faint={!taken} glow={taken ? 1 - ramp(frame, tab + 3, 30) * 0.6 : 0}>{draft}</PromptBox>
          <Line dim show={taken ? 0 : ramp(frame, len * 0.1)}>{'  ↑ faint ghost text follows your picks'}</Line>
        </Terminal>
      </Camera>
      <Keycap label="Tab" at={tab} />
    </AbsoluteFill>
  )
}

// 5. Only what matters, and knowing when to wait.
const SmartScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const flip = Math.round(len * 0.5)
  const waiting = frame >= flip
  return (
    <AbsoluteFill>
      <Caption
        key={waiting ? 'wait' : 'only'}
        title={waiting ? 'Knows when to just wait' : 'Only what matters'}
        sub={waiting ? 'no busywork while CI runs' : 'from none to 5 steps, never padded'}
        at={waiting ? flip : 4}
      />
      <Camera len={len} from={1} to={1.06}>
        <Terminal height={400} top={360}>
          {waiting ? (
            <>
              <Line dim>⏺ Pushed. CI is running on the branch.</Line>
              <Line />
              <Line show={ramp(frame, flip + 4)} dim>
                next: nothing to do now, wait for the CI run to finish{'   '}
                <span style={{ color: ACCENT }}>0</span>: dismiss
              </Line>
            </>
          ) : (
            <>
              <Line dim>⏺ Fixed the typo in the header.</Line>
              <Line />
              <Line dim show={ramp(frame, 8)}>next: type numbers to pick, Tab or 9 to use them, 0 to dismiss</Line>
              <Line show={ramp(frame, 14)} indent={28}>1: [ ] Commit the fix<Rec /></Line>
            </>
          )}
        </Terminal>
      </Camera>
    </AbsoluteFill>
  )
}

// 6. The settings pane with its live preview.
const SettingsScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const [first, second] = T.keys.settings
  const modes = ['label', 'label+prompt', 'prompt'] as const
  const mode = modes[frame >= second + 3 ? 2 : frame >= first + 3 ? 1 : 0]
  const rows: Array<[string, string]> = [
    ['Selection mode', 'multi'],
    ['Key 8 picks', 'recommended'],
    ['Max suggestions', '5'],
    ['Display', mode],
    ['Prompt style', 'standard'],
  ]
  const preview =
    mode === 'label'
      ? ['1: [ ] Run the tests (Recommended)', '2: [ ] Commit the change']
      : mode === 'label+prompt'
        ? ['1: [ ] Run the tests (Recommended)', '       Run the unit tests and fix any failure.', '2: [ ] Commit the change']
        : ['1: [ ] Run the unit tests and fix any failure. (Recommended)', '2: [ ] Commit the change with a short message.']
  return (
    <AbsoluteFill>
      <Caption title="Tune everything" sub={<span>/next-steps-plus · settings with a <span style={{ color: TEXT }}>live preview</span></span>} />
      <Camera len={len} from={1} to={1.08} x={0.5} y={0.7}>
        <Terminal top={270} height={720}>
          <Line dim>Settings</Line>
          {rows.map(([name, value]) => (
            <Line key={name}>
              <span style={{ color: name === 'Display' ? ACCENT : TEXT }}>{name === 'Display' ? '▸ ' : '  '}{name.padEnd(18)}</span>
              <span style={{ color: name === 'Display' ? TEXT : DIM, fontWeight: name === 'Display' ? 800 : 400 }}>{value}</span>
            </Line>
          ))}
          <div style={{ borderTop: `1px solid ${LINE}`, margin: '16px 0' }} />
          <Line dim>Preview</Line>
          {preview.map(text => (
            <Line key={text} indent={28}>{text}</Line>
          ))}
        </Terminal>
      </Camera>
      <Keycap label="Enter" at={first} />
      <Keycap label="Enter" at={second} />
    </AbsoluteFill>
  )
}

// 7. What NS+ adds, the install line, the logo, and the credit. The music
// slows down here: the heading and each line land on a slowing beat, and the
// install line, logo and credit land with the final chord.
const EndScene: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const adds = [
    'Pick several, send one numbered prompt',
    'Tab takes your picks',
    '(Recommended) steps, 8 selects them',
    'Only what matters, knows when to wait',
    'Settings pane with a live preview',
  ]
  const beats = T.outro
  const final = beats[beats.length - 1]
  const logo = spring({ frame: frame - final, fps, config: { damping: 12 } })
  return (
    <AbsoluteFill style={{ fontFamily: UI, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 58, fontWeight: 800, color: TEXT, opacity: ramp(frame, beats[0]), letterSpacing: -1 }}>
        Everything next-steps does, plus:
      </div>
      <div style={{ marginTop: 34, fontSize: 36, lineHeight: 1.65 }}>
        {adds.map((a, i) => (
          <div key={a} style={{ color: TEXT, opacity: ramp(frame, beats[i + 1], 8), transform: `translateX(${(1 - ramp(frame, beats[i + 1], 8)) * 40}px)` }}>
            <span style={{ color: MINT, marginRight: 18 }}>✓</span>
            {a}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 30 }}>
        <Img src={staticFile('icon.png')} style={{ width: 110, height: 110, transform: `scale(${logo})`, opacity: logo }} />
        <div
          style={{
            fontFamily: MONO, fontSize: 30, color: TEXT, background: PANEL, border: `1px solid ${LINE}`,
            borderRadius: 14, padding: '18px 30px', opacity: ramp(frame, final, 8),
          }}
        >
          <span style={{ color: ACCENT }}>/plugin install</span> next-steps-plus --marketplace TeeratP/next-steps-plus
        </div>
      </div>
      <div style={{ marginTop: 24, fontSize: 24, color: DIM, opacity: ramp(frame, final + 8) }}>
        github.com/TeeratP/next-steps-plus · for the Claude Code terminal · built on next-steps by Thariq Shihipar
      </div>
    </AbsoluteFill>
  )
}

const SCENES: Array<[React.FC<SceneProps>, number]> = [
  [ProblemScene, T.scenes.problem],
  [LogoScene, T.scenes.logo],
  [PickScene, T.scenes.pick],
  [TabScene, T.scenes.tab],
  [SmartScene, T.scenes.smart],
  [SettingsScene, T.scenes.settings],
  [EndScene, T.scenes.end],
]

export const INTRO45_FRAMES = reelFrames(SCENES)
export const Intro45: React.FC = () => <Reel music="music.wav" scenes={SCENES} />
