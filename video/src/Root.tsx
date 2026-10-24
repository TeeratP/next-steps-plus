import React from 'react'
import { Composition } from 'remotion'
import { INTRO45_FRAMES, Intro45 } from './Intro45'
import { TEASER25_FRAMES, Teaser25 } from './Teaser25'

// Two separate videos, each its own script: the 45 s intro and the 25 s teaser.
export const Root: React.FC = () => (
  <>
    <Composition id="Intro" component={Intro45} durationInFrames={INTRO45_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Teaser" component={Teaser25} durationInFrames={TEASER25_FRAMES} fps={30} width={1920} height={1080} />
  </>
)
