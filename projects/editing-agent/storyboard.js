(() => {
  'use strict';
  const root=document.documentElement;
  root.classList.add('cat-dream-story','storyboard-art');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const names=['sleep','resolve','training','success','wake'];
  const labels=['胖猫日常','上秤立志','努力锻炼','瘦身成功','梦醒反转'];
  const images=names.map(name=>{const image=new Image();image.src='./assets/cat-story/'+name+'.png';return image;});
  const phone=document.getElementById('phone'),screen=document.createElement('canvas');
  screen.width=540;screen.height=960;screen.className='pixel-preview';
  screen.setAttribute('role','img');screen.setAttribute('aria-label','用户分镜：胖橘猫睡觉、上秤立志、跑步、照镜子，最后梦醒拿零食');phone.prepend(screen);
  const title=document.createElement('div'),caption=document.createElement('div');
  title.className='pixel-scene-title';caption.className='pixel-scene-caption';phone.append(title,caption);
  const assets=document.querySelector('.assets');
  assets.replaceChildren();const heading=document.createElement('small');heading.textContent='分镜素材 / 05';assets.append(heading);
  const thumbs=names.map((name,i)=>{const asset=document.createElement('div');asset.className='asset';asset.dataset.asset=i;
    const canvas=document.createElement('canvas');canvas.width=120;canvas.height=144;canvas.className='pixel-thumb';canvas.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=String(i+1).padStart(2,'0')+'\n'+labels[i];asset.append(canvas,label);assets.append(asset);return canvas;});
  // Source files stay intact. Viewport crops always use a single uniform scale.
  function source(index,p){const im=images[index];let crop=[.035,.035,.93,.93];
    if(index===1)crop=p<.47?[.036,.035,.928,.458]:[.036,.557,.928,.413];
    return {im,x:crop[0]*im.naturalWidth,y:crop[1]*im.naturalHeight,w:crop[2]*im.naturalWidth,h:crop[3]*im.naturalHeight};}
  function cover(c,s,width,height,zoom=1,fx=.5,fy=.5){const ratio=Math.max(width/s.w,height/s.h)*zoom;
    const sw=width/ratio,sh=height/ratio,sx=s.x+(s.w-sw)*fx,sy=s.y+(s.h-sh)*fy;
    c.drawImage(s.im,sx,sy,sw,sh,0,0,width,height);}
  function sparkle(c,x,y,size,alpha){c.save();c.globalAlpha=alpha;c.fillStyle='#ffe4a0';c.fillRect(x-size,y-2,size*2,4);c.fillRect(x-2,y-size,4,size*2);c.fillRect(x-4,y-4,8,8);c.restore();}
  let lastArgs=[0,'','',0],loaded=false,lastFrame='';
  function render(time,titleText,captionText,fade,shots){lastArgs=[time,titleText,captionText,fade,shots];
    const bounds=shots||[{from:0,to:3},{from:3,to:5},{from:5,to:8},{from:8,to:12},{from:12,to:15}];
    let index=bounds.findIndex(s=>time>=s.from&&time<s.to);if(index<0)index=time>=15?4:0;
    const p=Math.max(0,Math.min(1,(time-bounds[index].from)/(bounds[index].to-bounds[index].from)));
    // Text comes exclusively from active clips on the separate text track.
    // Drawing the footage canvas and its thumbnails never adds titles or captions.
    title.textContent=titleText||'';caption.textContent=captionText||'';
    title.hidden=!titleText;caption.hidden=!captionText;
    if(!loaded)return;
    const tick=reduced.matches?0:Math.floor(p*24)/24,key=[index,tick,titleText,captionText,fade].join('|');if(key===lastFrame)return;lastFrame=key;
    const c=screen.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
    const zoom=reduced.matches?1:index===2?1.025:1+tick*.035;
    cover(c,source(index,p),540,960,zoom,index===1?.54:.5,index===2?.56:.5);
    // Motion follows the edit clock: a push-in, a reaction cut, speed accents and a hold.
    if(!reduced.matches&&index===2){c.save();c.strokeStyle='#fff2cd';c.lineWidth=3;c.globalAlpha=.48;for(let i=0;i<3;i++){const offset=(Math.floor(time*12)+i*3)%12;c.beginPath();c.moveTo(20+offset*3,380+i*48);c.lineTo(47+offset*3,380+i*48);c.stroke();}c.restore();}
    if(!reduced.matches&&index===3){[[178,441],[391,478],[194,611]].forEach(([x,y],i)=>sparkle(c,x,y,7+(i%2)*3,.25+.5*Math.max(0,Math.sin(time*4+i*2))));}
    if(index===4&&p<.12){c.fillStyle='rgba(245,229,186,'+(1-p/.12)*.75+')';c.fillRect(0,0,540,960);}
    if(fade>0){c.fillStyle='rgba(245,229,186,'+fade+')';c.fillRect(0,0,540,960);}
  }
  window.paintEditingPixel=render;
  Promise.all(images.map(im=>im.decode())).then(()=>{loaded=true;thumbs.forEach((canvas,i)=>{const c=canvas.getContext('2d');c.imageSmoothingQuality='high';cover(c,source(i,.6),120,144,1,i===1?.54:.5,i===0||i===4?.62:.58);});render(...lastArgs);}).catch(()=>{document.getElementById('editorStatus').textContent='分镜加载失败，请刷新页面。';});
  render(...lastArgs);
})();
