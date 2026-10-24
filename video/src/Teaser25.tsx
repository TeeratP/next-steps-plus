// The 25 s NS+ teaser, its own script (not a cut of the intro): a 3 s hook,
// the logo on the drop, one continuous hero shot (pick, then Tab), a fast
// montage of the rest, and the end card. 120 BPM: a beat is 15 frames. All
// timing lives in timing.json, which scripts/music.py reads too: the logo
// slams in on the drop, keys land on beats, the music slows on the end card.
import React from 'react'
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion'
import {
  ACCENT, Caption, DIM, Keycap, LINE, Line, MINT, MONO, NSPlus, PANEL, PromptBox, Rec, Reel,
  SceneProps, TEXT, Terminal, UI, ramp, reelFrames,
} from './ui'
import timing from './timing.json'

const T = timing.teaser

// 0-3 s. The hook: the original lists three, one key, one prompt.
const Hook: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame()
  const [press] = T.keys.hook
  return (
    <AbsoluteFill>
      <Caption title="One suggestion at a time?" at={2} />
      <Terminal top={250} height={500}>
        <Line dim>⏺ Done. Added the login form and its tests.</Line>
        <Line />
        <Line dim show={ramp(frame, 4, 8)}>next: type 1-3 to put one in the prompt box</Line>
        <Line show={ramp(frame, 8, 8)} indent={28}>1: run the tests you just wrote</Line>
        <Line show={ramp(frame, 12, 8)} indent={28}>2: commit the change</Line>
        <Line show={ramp(frame, 16, 8)} indent={28}>3: /code-review high</Line>
        <PromptBox>{frame >= press + 4 ? 'run the tests you just wrote' : ''}</PromptBox>
      </Terminal>
      <Keycap label="1" at={press} />
    </AbsoluteFill>
  )
}

// 3-5 s. The drop: flash, the logo slams in, the promise.
const Slam: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame, fps, config: { damping: 9, stiffness: 200 } })
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: UI }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${ACCENT}bb 0%, transparent 55%)`, opacity: 1 - ramp(frame, 0, 8) }} />
      <Img src={staticFile('icon.png')} style={{ width: 300, height: 300, transform: `scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 1.6) }} />
      <div style={{ marginTop: 40, fontSize: 64, fontWeight: 800, color: TEXT, opacity: ramp(frame, 14, 8), letterSpacing: -1 }}>
        Pick many. <span style={{ color: ACCENT }}>Tab once.</span>
      </div>
    </AbsoluteFill>
  )
}

// 5-13 s. One continuous shot: pick with 8 and 3, the camera glides down to
// the prompt box, the ghost draft appears, Tab makes it real.
const Hero: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const [eight, three, tab] = T.keys.hero
  const glide = tab - 60
  const picks: number[] = frame >= three + 3 ? [0, 1, 2] : frame >= eight + 3 ? [0, 1] : []
  const items = [
    { label: 'Run the tests and fix any failure', rec: true },
    { label: 'Commit the change', rec: true },
    { label: 'Update the README', rec: false },
    { label: 'Open a pull request', rec: false },
  ]
  // Camera: hold on the list, then glide down and in to the prompt box.
  const g = interpolate(frame, [glide, glide + 40], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) })
  const scale = 1.04 + 0.16 * g
  const originY = 50 + 30 * g
  const draft = 'Do these tasks:\n1. Run the tests and fix any failure.\n2. Commit the change.\n3. Update the README.'
  const ghost = frame >= glide + 10
  const taken = frame >= tab + 3
  return (
    <AbsoluteFill>
      <Caption key={taken ? 'tab' : 'pick'} title={taken ? 'Tab once.' : <span><NSPlus />: pick several</span>} at={taken ? tab + 3 : 4} />
      {/* The camera's view starts under the caption, so the zoomed terminal
          never slides up behind it. */}
      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: `50% ${originY}%` }}>
        <Terminal top={20} height={760}>
          <Line dim>⏺ Done. Added the login form and its tests.</Line>
          <Line />
          <Line dim show={ramp(frame, 6, 8)}>next: type numbers to pick, Tab or 9 to use them</Line>
          {items.map((item, i) => {
            const order = picks.indexOf(i)
            return (
              <Line key={item.label} show={ramp(frame, 10 + i * 3, 8)} indent={28}>
                <span>{i + 1}: </span>
                <span style={{ color: order === -1 ? DIM : MINT, fontWeight: order === -1 ? 400 : 800 }}>
                  {order === -1 ? '[ ]' : `[${order + 1}]`}
                </span>
                <span> {item.label}</span>
                {item.rec ? <Rec /> : null}
              </Line>
            )
          })}
          <Line show={ramp(frame, 24, 8)} indent={28}>
            <span style={{ color: ACCENT }}>8</span>: select recommended{'   '}
            <span style={{ color: ACCENT }}>Tab</span>: use selected{picks.length > 0 ? ` (${picks.length})` : ''}
          </Line>
          <PromptBox faint={!taken} glow={taken ? 1 - ramp(frame, tab + 3, 30) * 0.6 : 0}>{ghost ? draft : ''}</PromptBox>
        </Terminal>
      </AbsoluteFill>
      </div>
      <Keycap label="8" at={eight} />
      <Keycap label="3" at={three} />
      <Keycap label="Tab" at={tab} />
    </AbsoluteFill>
  )
}

// 13-19 s. Three quick beats, a bar each, of what else it does, one card each.
const Montage: React.FC<SceneProps> = ({ len }) => {
  const frame = useCurrentFrame()
  const card = Math.floor(len / 3)
  const i = Math.min(2, Math.floor(frame / card))
  const local = frame - i * card
  const cards: Array<{ title: string; body: React.ReactNode }> = [
    {
      title: 'Marks what matters',
      body: (
        <>
          <Line indent={10}>1: [ ] Run the tests<Rec /></Line>
          <Line indent={10}>2: [ ] Commit the change<Rec /></Line>
        </>
      ),
    },
    {
      title: 'Knows when to wait',
      body: <Line dim>next: nothing to do now, wait for the CI run to finish</Line>,
    },
    {
      title: 'Tune it, live',
      body: (
        <>
          <Line><span style={{ color: ACCENT }}>▸ Display</span>{'          '}<span style={{ fontWeight: 800 }}>prompt</span></Line>
          <Line dim>Preview: 1: [ ] Run the unit tests and fix any failure.</Line>
        </>
      ),
    },
  ]
  const pop = ramp(local, 0, 6)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: UI }}>
      <div style={{ opacity: pop, transform: `scale(${0.92 + 0.08 * pop})`, textAlign: 'center' }}>
        <div style={{ fontSize: 80, fontWeight: 800, color: TEXT, letterSpacing: -1 }}>{cards[i]?.title}</div>
        <div
          style={{
            marginTop: 40, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 18, padding: '26px 40px',
            fontFamily: MONO, fontSize: 30, lineHeight: 1.6, textAlign: 'left', boxShadow: `0 0 80px ${ACCENT}1f`,
          }}
        >
          {cards[i]?.body}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// 19-25 s. The call to action only (the features were just shown): logo,
// tagline, install line, credit, each on a slowing beat of the outro; the
// credit and a glow on the logo land with the final chord.
const End: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const [, tagline, install, final] = T.outro
  const logo = spring({ frame, fps, config: { damping: 12 } })
  const ring = frame >= final ? 1 - ramp(frame, final, 45) : 0
  return (
    <AbsoluteFill style={{ fontFamily: UI, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <Img
          src={staticFile('icon.png')}
          style={{ width: 170, height: 170, transform: `scale(${logo * (1 + 0.06 * ring)})`, filter: `drop-shadow(0 0 ${50 * ring}px ${ACCENT})` }}
        />
        <div style={{ fontSize: 80, fontWeight: 800, color: TEXT, opacity: ramp(frame, 6), letterSpacing: -1.5 }}>next-steps-plus</div>
      </div>
      <div style={{ marginTop: 36, fontSize: 54, fontWeight: 800, color: TEXT, opacity: ramp(frame, tagline, 8), letterSpacing: -1 }}>
        Pick many. <span style={{ color: ACCENT }}>Tab once.</span>
      </div>
      <div
        style={{
          marginTop: 50, fontFamily: MONO, fontSize: 34, color: TEXT, background: PANEL, border: `1px solid ${LINE}`,
          borderRadius: 16, padding: '22px 36px', opacity: ramp(frame, install, 8),
          transform: `translateY(${(1 - ramp(frame, install, 8)) * 16}px)`, boxShadow: `0 0 80px ${ACCENT}1f`,
        }}
      >
        <span style={{ color: ACCENT }}>/plugin install</span> next-steps-plus --marketplace TeeratP/next-steps-plus
      </div>
      <div style={{ marginTop: 26, fontSize: 26, color: DIM, opacity: ramp(frame, final, 10) }}>
        for the Claude Code terminal · built on next-steps by Thariq Shihipar
      </div>
    </AbsoluteFill>
  )
}

const SCENES: Array<[React.FC<SceneProps>, number]> = [
  [Hook, T.scenes.hook],
  [Slam, T.scenes.logo],
  [Hero, T.scenes.hero],
  [Montage, T.scenes.montage],
  [End, T.scenes.end],
]

export const TEASER25_FRAMES = reelFrames(SCENES)
export const Teaser25: React.FC = () => <Reel music="music-25.wav" scenes={SCENES} />
