import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {geometry, sceneMarkup, pullAtFrame} from './scene.js';

export function DrawerPull() {
  const frame=useCurrentFrame();
  const p=frame<100?pullAtFrame(frame-12):1-pullAtFrame(frame-110);
  const g=geometry(p);
  return <AbsoluteFill style={{background:'#e6e7df',justifyContent:'flex-start',paddingTop:30}}>
    <div style={{width:800,height:g.height}} dangerouslySetInnerHTML={{__html:sceneMarkup(g,{labels:true})}} />
  </AbsoluteFill>;
}
const Root=()=> <Composition id="NotesDrawerPull" component={DrawerPull} durationInFrames={192} fps={60} width={800} height={650}/>;
registerRoot(Root);
