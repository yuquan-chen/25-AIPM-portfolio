import {geometry,sceneMarkup,pullAtFrame,liftAtFrame,FILES,FPS,DURATION} from './scene.js';

const cabinet=document.getElementById('notesCabinet');
if(cabinet) {
  const scene=document.getElementById('notesDrawer');
  const art=document.getElementById('notesDrawerArt');
  const trigger=document.getElementById('notesDrawerTrigger');
  const folders=[...cabinet.querySelectorAll('[data-journey]')];
  const reader=document.getElementById('notesFileReader');
  const readerDate=document.getElementById('notesReaderDate');
  const detail=document.getElementById('journey-detail');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let pull=0, reading=0, selected=-1, hovered=-1, opened=false, animation=0, width=cabinet.clientWidth;
  let readingTarget=false, switching=false;
  let layout;
  const position=(element,x,y,w,h)=>Object.assign(element.style,{left:`${x/8}%`,top:`${y/layout.height*100}%`,width:`${w/8}%`,height:`${h/layout.height*100}%`});

  function paint() {
    const mobile=width<560;
    layout=geometry(pull,reading,selected,mobile,Math.max(720,520*800/Math.max(width,280)));
    scene.style.aspectRatio=`800 / ${layout.height}`;
    art.innerHTML=sceneMarkup(layout,{hover:hovered,mobile});
    position(trigger,layout.frontX,layout.frontY+13,800-2*layout.frontX,105);
    trigger.setAttribute('aria-expanded',String(opened));
    trigger.setAttribute('aria-label',opened?'收回随笔抽屉':'拉开随笔抽屉');
    trigger.querySelector('.notes-cabinet-label').textContent=opened?'Charles 的随笔 · 点击收回':'还想了解更多，打开抽屉查阅随笔区。';
    folders.forEach((button,i)=>{
      const f=layout.folders[i];
      position(button,f.tabX,f.y-(hovered===i&&!reading?9:0),f.tabW,reading>.05?34:layout.fileStep);
      button.style.setProperty('--label-height',`${34*width/800}px`);
      button.style.visibility=pull>.94?'visible':'hidden';
      const settledReading=readingTarget && reading>.99;
      const canAct=opened && !switching && (reading<.05 || settledReading);
      const canReturn=settledReading && selected===i;
      button.disabled=!canAct;
      button.title=canReturn?'点击文件标题收回':settledReading?'切换到这份随笔':'打开这份随笔';
      button.setAttribute('aria-expanded',String(readingTarget && selected===i && reading>.8));
    });
    reader.hidden=!opened || selected<0 || reading<.01;
    detail.hidden=reader.hidden;
    if(!reader.hidden) {
      position(reader,50,layout.readerTop,700,layout.readerHeight*reading);
      readerDate.textContent=selected>=0 ? FILES[selected].date : '';
      detail.hidden=false;
    }
    cabinet.dataset.drawerState=!reader.hidden?'reading':opened?'open':'closed';
    cabinet.dataset.motionProgress=pull.toFixed(3);
  }

  // Remotion's deterministic spring keeps every face on the same timeline.
  function animate(targetPull,targetRead,onFinish) {
    cancelAnimationFrame(animation);
    const fromPull=pull,fromRead=reading,start=performance.now();
    const movingDrawer=Math.abs(targetPull-fromPull)>.001;
    const frames=movingDrawer?DURATION:42;
    function tick(now) {
      const frame=reduced.matches?frames:(now-start)*FPS/1000;
      const progress=movingDrawer?pullAtFrame(frame):liftAtFrame(frame);
      pull=fromPull+(targetPull-fromPull)*progress;
      reading=fromRead+(targetRead-fromRead)*progress;
      paint();
      if(frame<frames) animation=requestAnimationFrame(tick);
      else {pull=targetPull;reading=targetRead;paint();onFinish?.();}
    }
    animation=requestAnimationFrame(tick);
  }

  function openDrawer(scroll=false) {
    if(opened) {if(scroll) cabinet.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});return;}
    opened=true;
    readingTarget=false;
    switching=false;
    selected=-1;
    hovered=-1;
    detail.hidden=true;
    animate(1,0,()=>{
      if(opened) {
        folders[0].focus({preventScroll:true});
        if(cabinet.getBoundingClientRect().top>innerHeight/3) cabinet.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
      }
    });
    if(scroll) cabinet.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  }

  function closeDrawer() {
    opened=false;
    readingTarget=false;
    switching=false;
    hovered=-1;
    reader.hidden=true;
    detail.hidden=true;
    animate(0,0,()=>{selected=-1;paint();});
    trigger.focus({preventScroll:true});
  }

  function returnFile() {
    if(switching) return;
    switching=true;
    readingTarget=false;
    const previousSelected=selected;
    hovered=-1;
    animate(1,0,()=>{
      selected=-1;
      switching=false;
      paint();
      folders[previousSelected]?.focus({preventScroll:true});
    });
  }

  function switchFile(next) {
    if(switching || !opened || selected===next) return;
    switching=true;
    readingTarget=false;
    hovered=-1;
    animate(1,0,()=>{
      selected=next;
      readingTarget=true;
      reader.scrollTop=0;
      detail.hidden=true;
      animate(1,1,()=>{
        switching=false;
        detail.hidden=false;
        paint();
        folders[next].focus({preventScroll:true});
      });
    });
  }

  trigger.addEventListener('click',()=>opened?closeDrawer():openDrawer());
  document.querySelectorAll('[data-open-notes]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();openDrawer(true);
  }));
  folders.forEach((button,i)=>{
    button.addEventListener('pointerenter',()=>{hovered=i;paint();});
    button.addEventListener('pointerleave',()=>{hovered=-1;paint();});
    button.addEventListener('click',()=>{
      if(!opened||switching) return;
      if(readingTarget && reading>.99) {
        if(selected===i) returnFile(); else switchFile(i);
        return;
      }
      if(reading>.05) return;
      selected=i;hovered=-1;
      readingTarget=true;
      reader.scrollTop=0;
      detail.hidden=true;
      animate(1,1,()=>{
        detail.hidden=false;folders[i].focus({preventScroll:true});
      });
    });
    button.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowDown'||event.key==='ArrowRight') next=(i+1)%FILES.length;
      if(event.key==='ArrowUp'||event.key==='ArrowLeft') next=(i+FILES.length-1)%FILES.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=FILES.length-1;
      if(next!==undefined) {event.preventDefault();folders[next].focus({preventScroll:true});}
    });
  });
  cabinet.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!opened) return;
    event.preventDefault();
    if(reading>.05) returnFile(); else closeDrawer();
  });
  new ResizeObserver(entries=>{width=entries[0].contentRect.width;paint();}).observe(cabinet);
  paint();
  trigger.disabled=false;
}
