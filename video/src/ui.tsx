// Shared look and building blocks for the NS+ videos: colours, the terminal
// window, captions, keycaps, quick cuts and camera moves. Each video (the
// 45 s intro, the 25 s teaser) is its own script built from these.
import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion'

export const BG = '#0d0e12'
export const PANEL = '#16171d'
export const LINE = '#262832'
export const TEXT = '#ececf0'
export const DIM = '#8a8f9b'
export const ACCENT = '#d97757'
export const MINT = '#5ee0aa'
export const MONO = '"SF Mono", Menlo, monospace'
export const UI = '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif'

export type SceneProps = { len: number }

// 0 → 1 over [from, from + length] frames, eased.
export function ramp(frame: number, from: number, length = 12): number {
  return interpolate(frame, [from, from + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })
}

// Quick cuts: a scene snaps in (scale and fade) and out at its edges.
export const SceneCut: React.FC<{ len: number; children: React.ReactNode }> = ({ len, children }) => {
  const frame = useCurrentFrame()
  const inT = ramp(frame, 0, 8)
  const outT = ramp(frame, len - 7, 7)
  return (
    <AbsoluteFill style={{ opacity: Math.min(inT, 1 - outT), transform: `scale(${0.97 + 0.03 * inT + 0.04 * outT})` }}>
      {children}
    </AbsoluteFill>
  )
}

// A slow camera push over a scene: scales from `from` to `to`, centred on a
// point (fractions of the frame), with a smooth ease.
export const Camera: React.FC<{ len: number; from?: number; to?: number; x?: number; y?: number; children: React.ReactNode }> = ({
  len, from = 1, to = 1.1, x = 0.5, y = 0.55, children,
}) => {
  const frame = useCurrentFrame()
  const s = interpolate(frame, [0, len], [from, to], { easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: `${x * 100}% ${y * 100}%` }}>{children}</AbsoluteFill>
  )
}

// Big caption at the top, with an optional smaller line under it.
export const Caption: React.FC<{ title: React.ReactNode; sub?: React.ReactNode; at?: number }> = ({ title, sub, at = 4 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = spring({ frame: frame - at, fps, config: { damping: 15, stiffness: 180 } })
  return (
    <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', fontFamily: UI, zIndex: 2 }}>
      <div style={{ fontSize: 72, fontWeight: 800, color: TEXT, opacity: s, transform: `translateY(${(1 - s) * 40}px)`, letterSpacing: -1 }}>
        {title}
      </div>
      {sub === undefined ? null : (
        <div style={{ fontSize: 32, color: DIM, marginTop: 12, opacity: ramp(frame, at + 8, 12) }}>{sub}</div>
      )}
    </div>
  )
}

// A terminal window: title dots, then whatever is inside.
export const Terminal: React.FC<{ children: React.ReactNode; top?: number; height?: number }> = ({ children, top = 280, height = 660 }) => (
  <div
    style={{
      position: 'absolute', left: 250, right: 250, top, height, background: PANEL, borderRadius: 22,
      border: `1px solid ${LINE}`, boxShadow: `0 40px 140px rgba(0,0,0,0.6), 0 0 80px ${ACCENT}14`, overflow: 'hidden',
    }}
  >
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 22, borderBottom: `1px solid ${LINE}` }}>
      {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
        <div key={c} style={{ width: 15, height: 15, borderRadius: 8, background: c }} />
      ))}
      <div style={{ marginLeft: 18, color: DIM, fontFamily: MONO, fontSize: 20 }}>claude</div>
    </div>
    <div style={{ padding: '26px 40px', fontFamily: MONO, fontSize: 27, lineHeight: 1.55, color: TEXT }}>{children}</div>
  </div>
)

// One terminal line; `show` slides it in from the left.
export const Line: React.FC<{ children?: React.ReactNode; dim?: boolean; show?: number; indent?: number }> = ({
  children, dim, show = 1, indent = 0,
}) => (
  <div style={{ color: dim ? DIM : TEXT, opacity: show, transform: `translateX(${(1 - show) * -30}px)`, whiteSpace: 'pre', paddingLeft: indent }}>
    {children ?? ' '}
  </div>
)

// The prompt box at the bottom of the terminal; `glow` lights its border.
export const PromptBox: React.FC<{ children?: React.ReactNode; faint?: boolean; glow?: number }> = ({ children, faint, glow = 0 }) => (
  <div
    style={{
      marginTop: 22, border: `1px solid ${glow > 0 ? ACCENT : LINE}`, borderRadius: 12, padding: '14px 20px', minHeight: 44,
      boxShadow: `0 0 ${40 * glow}px ${ACCENT}66`,
    }}
  >
    <span style={{ color: ACCENT }}>{'> '}</span>
    <span style={{ color: faint ? DIM : TEXT, fontStyle: faint ? 'italic' : 'normal', whiteSpace: 'pre-wrap' }}>{children}</span>
  </div>
)

// A key being pressed: pops in at the bottom right and fades.
export const Keycap: React.FC<{ label: string; at: number }> = ({ label, at }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < at || frame > at + 34) return null
  const s = spring({ frame: frame - at, fps, config: { damping: 10, stiffness: 220 } })
  const fade = 1 - ramp(frame, at + 24, 10)
  return (
    <div
      style={{
        position: 'absolute', right: 120, bottom: 110, minWidth: 116, height: 116, padding: '0 28px', borderRadius: 24,
        background: '#24262f', border: `3px solid ${ACCENT}`, color: TEXT, fontFamily: UI, fontSize: 54, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${0.5 + 0.5 * s})`, opacity: fade,
        boxShadow: `0 0 60px ${ACCENT}77`, zIndex: 3,
      }}
    >
      {label}
    </div>
  )
}

export const Rec: React.FC = () => <span style={{ color: ACCENT }}> (Recommended)</span>
export const NSPlus: React.FC = () => (
  <span>
    NS<sup style={{ color: ACCENT }}>+</sup>
  </span>
)

// Plays scenes back to back over a music track.
export const Reel: React.FC<{ music: string; scenes: Array<[React.FC<SceneProps>, number]> }> = ({ music, scenes }) => {
  let from = 0
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #1a1c24 0%, ${BG} 70%)` }}>
      <Audio src={staticFile(music)} />
      {scenes.map(([Scene, len], i) => {
        const start = from
        from += len
        return (
          <Sequence key={i} from={start} durationInFrames={len}>
            <SceneCut len={len}>
              <Scene len={len} />
            </SceneCut>
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}

export function reelFrames(scenes: Array<[unknown, number]>): number {
  return scenes.reduce((sum, [, len]) => sum + len, 0)
}
