/* Local clock by default; explicit light=day/night links preview a fixed time. */
(() => {
  'use strict';
  const root=document.documentElement;
  const requestedPreview=new URLSearchParams(location.search).get('light');
  const previewHour=requestedPreview==='day'?12:requestedPreview==='night'?20:null;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const mix=(a,b,t)=>a.map((value,i)=>lerp(value,b[i],t));
  const rgb=values=>'rgb('+values.map(Math.round).join(',')+')';
  const stops=[
    {hour:6, position:[-6,2,-3], color:[1,.83,.66], power:1.35, ambient:.28, paper:[238,237,229]},
    {hour:9, position:[-4.5,5,-2], color:[1,.97,.89], power:1.55, ambient:.32, paper:[236,240,234]},
    {hour:12,position:[0,8,-1], color:[.96,1,1], power:1.65, ambient:.36, paper:[237,241,236]},
    {hour:15,position:[4.5,5,-2], color:[1,.93,.80], power:1.52, ambient:.30, paper:[237,240,233]},
    {hour:18,position:[6,2,-3], color:[1,.75,.56], power:1.32, ambient:.25, paper:[236,234,227]}
  ];
  function sample(hour){
    if(hour>=18||hour<6){
      const nightHour=hour<6?hour+24:hour;
      const depth=Math.sin((nightHour-18)/12*Math.PI);
      return {position:[-3.8,3.4,-2],color:[1,.83,.64],power:lerp(1.30,1.08,depth),ambient:lerp(.25,.21,depth),paper:mix([20,32,28],[14,24,22],depth)};
    }
    let index=0;while(index<stops.length-2&&hour>=stops[index+1].hour)index++;
    const a=stops[index],b=stops[index+1],t=(hour-a.hour)/(b.hour-a.hour);
    return {position:mix(a.position,b.position,t),color:mix(a.color,b.color,t),power:lerp(a.power,b.power,t),ambient:lerp(a.ambient,b.ambient,t),paper:mix(a.paper,b.paper,t)};
  }
  function update(){
    const now=new Date();
    if(previewHour!==null)now.setHours(previewHour,0,0,0);
    const hour=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
    const dark=hour>=18||hour<6,light=sample(hour);
    // A single designed solar arc drives the room, window projection and CC shadows.
    // This follows local clock time, not geographic solar calculations.
    const dayProgress=Math.max(0,Math.min(1,(hour-6)/12));
    light.direction=dark?[-1,.65,.40]:[
      -1,
      .20+Math.sin(dayProgress*Math.PI)*.45,
      Math.sin((dayProgress-.5)*Math.PI)*.50
    ];
    root.dataset.lightMode=dark?'night':'day';
    root.style.colorScheme=dark?'dark':'light';
    root.style.setProperty('--paper',rgb(light.paper));
    root.style.setProperty('--sheet',rgb(light.paper.map(v=>v+(dark?5:-7))));
    root.style.setProperty('--light-x',(50+light.position[0]*5)+'%');
    root.style.setProperty('--light-wash',dark?'rgba(194,153,105,.12)':'rgba(255,255,247,.70)');
    root.style.setProperty('--beam-angle',(112-light.position[0]*5)+'deg');
    root.style.setProperty('--beam-color',dark?'rgba(221,174,111,.075)':'rgba(255,255,247,.56)');
    root.style.setProperty('--shade-color',dark?'rgba(0,0,0,.25)':'rgba(83,103,89,.12)');
    root.style.setProperty('--shadow-shift',(-light.position[0]*13)+'px');
    root.style.setProperty('--shadow-stretch',String(dark?1.35:2.05-light.position[1]*.105));
    root.style.setProperty('--shadow-alpha',String(dark?.65:.30+(8-light.position[1])*.018));
    const clock=document.getElementById('local-light-time'),label=document.getElementById('local-light-label');
    if(clock){clock.dateTime=now.toISOString();clock.textContent=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');}
    if(label)label.textContent=dark?'夜间暖光':hour<10?'晨间侧光':hour<14?'日间光线':hour<17?'午后侧光':'傍晚暖光';
    if(previewHour!==null&&clock){
      label.textContent=dark?'夜间预览':'日间预览';
      document.querySelector('.clock-overline>span').textContent='光线预览 · PREVIEW';
      const clockGroup=document.querySelector('.day-clock');
      clockGroup.setAttribute('aria-label','固定时段光线预览');
      if(!document.getElementById('restore-live-light')){
        const link=document.createElement('a'),url=new URL(location.href);
        url.searchParams.delete('light');url.hash='home';
        link.id='restore-live-light';link.className='restore-live-light';link.href=url.href;link.textContent='恢复实时光线 ↗';clockGroup.append(link);
      }
    }
    root.style.setProperty('--clock-progress',String(hour/24*100)+'%');
    const dateLabel=document.getElementById('clock-date');
    if(dateLabel)dateLabel.textContent=String(now.getMonth()+1).padStart(2,'0')+' / '+String(now.getDate()).padStart(2,'0');
    window.coverLighting={...light,dark};
    window.dispatchEvent(new Event('coverlightchange'));
  }
  update();
  document.addEventListener('DOMContentLoaded',update,{once:true});
  setInterval(()=>{if(!document.hidden)update();},1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});
  window.addEventListener('pageshow',update);
})();
