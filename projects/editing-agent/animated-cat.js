(() => {
  'use strict';
  document.documentElement.classList.add('cat-dream-story','storyboard-art');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const atlas=new Image(),rooms=new Image(),poses=new Image();
  poses.src='./assets/cat-story/slim-poses.png';
  atlas.src='./assets/cat-story/cat-motion-atlas.png';rooms.src='./assets/cat-story/room-stages.png';
  const phone=document.getElementById('phone'),screen=document.createElement('canvas');
  screen.width=540;screen.height=960;screen.className='pixel-preview';screen.setAttribute('role','img');screen.setAttribute('aria-label','像素角色动画：胖猫呼吸打呼噜、上秤、跑步、瘦身，最后梦醒');phone.prepend(screen);
  const title=document.createElement('div'),caption=document.createElement('div');title.className='pixel-scene-title';caption.className='pixel-scene-caption';phone.append(title,caption);
  const labels=['胖猫日常','上秤立志','努力锻炼','瘦身成功','梦醒反转'];
  const assets=document.querySelector('.assets');assets.replaceChildren();const heading=document.createElement('small');heading.textContent='动画素材 / 05';assets.append(heading);
  const thumbs=labels.map((label,i)=>{const el=document.createElement('div');el.className='asset';el.dataset.asset=i;const canvas=document.createElement('canvas');canvas.width=120;canvas.height=144;canvas.className='pixel-thumb';canvas.setAttribute('aria-hidden','true');const name=document.createElement('span');name.textContent=String(i+1).padStart(2,'0')+'\n'+label;el.append(canvas,name);assets.append(el);return canvas;});
  let ready=false,lastArgs=[0,'','',0],lastFrame='',sprites=[],poseBounds=[];
  function locatePoses(){const c=document.createElement('canvas');c.width=poses.width;c.height=poses.height;const ctx=c.getContext('2d');ctx.drawImage(poses,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;
    for(let row=0;row<2;row++)for(let col=0;col<2;col++){const x0=Math.floor(col*c.width/2),x1=Math.floor((col+1)*c.width/2),y0=Math.floor(row*c.height/2),y1=Math.floor((row+1)*c.height/2);let left=x1,top=y1,right=x0,bottom=y0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*c.width+x)*4+3]>100){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}poseBounds.push({x:left,y:top,w:right-left+1,h:bottom-top+1});}}
  function flexPose(c,index,cx,ground,height,flip=false){const s=poseBounds[index],scale=height/s.h;c.save();c.translate(Math.round(cx),Math.round(ground));if(flip)c.scale(-1,1);c.drawImage(poses,s.x,s.y,s.w,s.h,Math.round(-s.w*scale/2),-height,Math.round(s.w*scale),height);c.restore();}
  // Read alpha bounds only; the generated atlas remains untouched on disk.
  function locateSprites(){const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;const ctx=c.getContext('2d');ctx.drawImage(atlas,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;
    const cols=[0,379,739,1098,1448].map(x=>Math.round(x*atlas.width/1448)),rows=[0,380,697,1086].map(y=>Math.round(y*atlas.height/1086));
    for(let row=0;row<3;row++)for(let col=0;col<4;col++){let left=cols[col+1],top=rows[row+1],right=cols[col],bottom=rows[row];for(let y=rows[row];y<rows[row+1];y++)for(let x=cols[col];x<cols[col+1];x++)if(pixels[(y*c.width+x)*4+3]>100){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}sprites.push({x:left,y:top,w:right-left+1,h:bottom-top+1});}}
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function background(c,gym=false){c.drawImage(rooms,gym?rooms.width/2:0,0,rooms.width/2,rooms.height,0,0,540,960);}
  function passingDays(c,t){
    // Only the glass panes change: the window frame and room stay still.
    const cycle=(t%1.2)/1.2,night=reduced.matches?0:Math.max(0,Math.min(1,Math.min((cycle-.34)/.12,(1-cycle)/.12)));
    const mix=(a,b)=>'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*night)).join(',')+')';
    c.save();c.beginPath();[[51,69,64,84],[130,69,72,84],[51,168,64,80],[130,168,72,80]].forEach(r=>c.rect(...r));c.clip();
    rect(c,48,65,160,190,mix([135,190,207],[35,51,81]));
    c.save();c.globalAlpha=1-night;const sunY=93+Math.round(Math.sin(cycle*Math.PI*2)*10);rect(c,149,sunY,31,31,'#ffe6a5');rect(c,57+Math.round(cycle*24),122,30,6,'#d7e5d4');c.restore();
    c.save();c.globalAlpha=night;rect(c,151,92,28,29,'#f1e3b7');rect(c,163,88,20,27,mix([135,190,207],[35,51,81]));[[65,87],[100,110],[189,134],[143,183],[83,174]].forEach(([x,y])=>{rect(c,x,y,3,7,'#e8dfbd');rect(c,x-2,y+2,7,3,'#e8dfbd');});c.restore();
    c.fillStyle=mix([121,153,105],[53,78,73]);c.beginPath();[[51,183],[71,183],[71,201],[81,201],[81,220],[99,220],[99,249],[51,249]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.beginPath();[[143,249],[143,239],[153,239],[153,227],[166,227],[166,217],[181,217],[181,202],[202,202],[202,249]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.restore();
  }
  function sprite(c,index,cx,ground,scale,flip=false){const s=sprites[index];c.save();c.translate(Math.round(cx),Math.round(ground));if(flip)c.scale(-1,1);c.drawImage(atlas,s.x,s.y,s.w,s.h,Math.round(-s.w*scale/2),Math.round(-s.h*scale),Math.round(s.w*scale),Math.round(s.h*scale));c.restore();}
  function star(c,x,y,phase){const r=6+Math.round(phase*5);rect(c,x-r,y-2,r*2,4,'#ffdc80');rect(c,x-2,y-r,4,r*2,'#fff0b8');}
  function snores(c,t){const cycle=(t%2.4)/2.4,r=6+Math.sin(cycle*Math.PI)*23;
    // A separate translucent nose bubble grows and pops; the room never scales.
    if(cycle<.92){c.save();c.globalAlpha=.45;c.fillStyle='#b4dfe0';c.beginPath();c.ellipse(185,406,r,r*.82,0,0,Math.PI*2);c.fill();c.globalAlpha=.9;c.strokeStyle='#e8f3d8';c.lineWidth=3;c.stroke();rect(c,178,397,4,5,'#fff5d8');c.restore();}
    for(let i=0;i<3;i++){const p=((t*.46+i*.32)%1);c.save();c.globalAlpha=Math.sin(p*Math.PI)*.95;c.fillStyle='#304c3b';c.font=(28+Math.round(p*16))+'px CutPixel, monospace';c.fillText('z',177+p*65,342-p*125);c.restore();}}
  function scale(c,p){c.fillStyle='#334c45';c.beginPath();c.moveTo(164,773);c.lineTo(381,773);c.lineTo(405,831);c.lineTo(141,831);c.closePath();c.fill();c.fillStyle='#cad0ad';c.beginPath();c.moveTo(170,778);c.lineTo(375,778);c.lineTo(390,818);c.lineTo(155,818);c.closePath();c.fill();rect(c,213,799,111,18,'#37473b');c.fillStyle='#ecad78';c.font='16px monospace';c.fillText(p<.14?'--.-':'8.8',246,813);}
  function drawScene(c,index,p,t){c.clearRect(0,0,540,960);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';background(c,index===2);
    const motion=reduced.matches?0:t;
    if(index===0){const frame=Math.floor(motion*1.65)%4;sprite(c,4+frame,275,565,1.04);if(!reduced.matches)snores(c,motion);}
    if(index===1){scale(c,p);const shock=p<.48;const hop=reduced.matches?0:Math.max(0,1-p*6)*18;sprite(c,shock?8:9,280,786-hop,.92);}
    if(index===2){
      passingDays(c,motion);
      // Belt markings move beneath the feet, independently of the character cycle.
      c.save();c.beginPath();c.moveTo(105,595);c.lineTo(406,595);c.lineTo(429,620);c.lineTo(79,620);c.closePath();c.clip();
      const travel=Math.floor(motion*125)%42;for(let x=65-travel;x<460;x+=42)rect(c,x,598,8,20,'#87a6a1');c.restore();
      const frame=Math.floor(motion*7)%4,bounce=reduced.matches?0:[0,7,0,5][frame];sprite(c,frame,230,597-bounce,.96);
      // Console is a foreground layer, so the pumping paws pass behind its rail.
      c.save();c.beginPath();[[357,423],[434,390],[495,390],[505,406],[487,453],[455,461],[491,603],[510,602],[510,666],[380,666],[380,628],[423,607],[389,459],[357,452]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();background(c,true);c.restore();
      if(!reduced.matches){for(let i=0;i<3;i++){const f=(motion*1.6+i*.33)%1;c.save();c.globalAlpha=Math.sin(f*Math.PI);rect(c,326+i*14,360+f*42,4,9,'#91c9d2');c.restore();}for(let i=0;i<3;i++){const v=(Math.floor(motion*12)+i*3)%12;rect(c,102-v*3,437+i*23,15,3,'#f4e6b6');}}
    }
    if(index===3){
      // Mirror and reflected sprite are separate from the triumphant character.
      rect(c,49,472,132,329,'#765139');rect(c,58,481,113,310,'#b17b4d');rect(c,64,487,101,298,'#94b3ad');
      const pose=reduced.matches?0:Math.min(3,Math.floor(p*4)),beat=(p*4)%1;
      const bounce=reduced.matches?0:Math.round(Math.sin(Math.min(1,beat*4)*Math.PI)*5);
      c.save();c.beginPath();c.rect(65,488,99,296);c.clip();c.globalAlpha=.6;flexPose(c,pose,114,786-bounce,280,true);c.restore();
      flexPose(c,pose,313,800-bounce,315);if(!reduced.matches)[[210,465],[417,532],[201,633]].forEach(([x,y],i)=>star(c,x,y,(Math.sin(motion*4+i*2)+1)/2));
    }
    if(index===4){const startled=p<.34;const lift=startled&&!reduced.matches?Math.sin(p/.34*Math.PI)*8:0;sprite(c,startled?11:4+Math.floor(motion*1.65)%4,275,565-lift,1.04);if(!startled&&!reduced.matches)snores(c,motion);if(p<.09){c.fillStyle='rgba(246,232,197,'+(1-p/.09)*.8+')';c.fillRect(0,0,540,960);}}
  }
  function render(time,titleText,captionText,fade,shots){lastArgs=[time,titleText,captionText,fade,shots];title.textContent=titleText||'';caption.textContent=captionText||'';title.hidden=!titleText;caption.hidden=!captionText;if(!ready)return;
    const bounds=shots||[{from:0,to:3},{from:3,to:5},{from:5,to:8},{from:8,to:12},{from:12,to:15}];let index=bounds.findIndex(s=>time>=s.from&&time<s.to);if(index<0)index=time>=15?4:0;const local=time-bounds[index].from,p=Math.max(0,Math.min(1,local/(bounds[index].to-bounds[index].from)));
    const frame=Math.floor(time*14),key=[frame,index,fade].join('|');if(key===lastFrame)return;lastFrame=key;const c=screen.getContext('2d');drawScene(c,index,p,local);
    if(fade>0){c.fillStyle='rgba(246,232,197,'+fade+')';c.fillRect(0,0,540,960);}}
  window.paintEditingPixel=render;
  Promise.all([atlas.decode(),rooms.decode(),poses.decode()]).then(()=>{locateSprites();locatePoses();ready=true;const frame=document.createElement('canvas');frame.width=540;frame.height=960;thumbs.forEach((thumb,i)=>{drawScene(frame.getContext('2d'),i,.6,1.1);const c=thumb.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(frame,0,225,540,648,0,0,120,144);});render(...lastArgs);}).catch(()=>{document.getElementById('editorStatus').textContent='动画素材加载失败，请刷新。';});
  render(...lastArgs);
})();
