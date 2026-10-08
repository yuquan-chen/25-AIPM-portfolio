(() => {
  'use strict';
  const canvas = document.getElementById('city');
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let windowVisible=true,animationId=0;
  const notebookButton=document.getElementById('notebook-hotspot');
  let notebookHovered=false,notebookFocused=false,notebookLift=0;
  let moving = !reduced.matches, mode = 'dusk', distance = 76, previous = 0, score = true;
  const colors = {
    dusk: { sky:'#b96b68', horizon:'#efb37c', cloud:'#f3c497', sun:'#ffe1a0', far:'#78546c', farSide:'#68445e', hill:'#906b77', wall:['#c26a57','#df9667','#b85f58','#d0aa7b','#b68165'], side:'#784253', shadow:'#542e48', roof:'#693748', window:'#f5c77d', darkWindow:'#76434f', street:'#a57769', tree:'#344b43', treeLight:'#627651', accent:'#ed9d76'},
    day: { sky:'#9cbcb2', horizon:'#e8d6ac', cloud:'#f4e5c6', sun:'#f8eac1', far:'#809994', farSide:'#6b8883', hill:'#91aaa0', wall:['#cb9979','#e3c295','#b98a77','#d1b798','#b8aa86'], side:'#877263', shadow:'#54665b', roof:'#626d5b', window:'#76988d', darkWindow:'#607b72', street:'#b0a089', tree:'#48624d', treeLight:'#849461', accent:'#c98764'}
  };
  const hash = (n) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const rect = (ctx,x,y,w,h,col) => {ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  function poly(ctx,points,col){ctx.fillStyle=col;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  function layer(width){const el=document.createElement('canvas');el.width=width;el.height=224;return [el,el.getContext('2d')];}
  function tree(ctx,x,y,p,size=1){
    rect(ctx,x+9*size,y+19*size,3*size,27*size,p.shadow);
    [[2,8,20,23],[7,0,12,32],[-3,15,29,12]].forEach(([a,b,w,h])=>rect(ctx,x+a*size,y+b*size,w*size,h*size,p.tree));
    [[7,3,10,7],[1,12,9,8],[14,11,6,6]].forEach(([a,b,w,h])=>rect(ctx,x+a*size,y+b*size,w*size,h*size,p.treeLight));
  }
  function makeLayers(){
    const p=colors[mode];
    const [far,f]=layer(1024),[middle,m]=layer(2048),[near,n]=layer(1024);
    // Distant hills and a quiet, stepped skyline.
    for(let x=0;x<1024;x+=64){const h=20+Math.floor(hash(x)*27);rect(f,x,154-h,64,h+50,p.hill);rect(f,x+12,147-h,37,10,p.hill);}
    for(let i=0;i<30;i++){const x=i*37,h=34+Math.floor(hash(i+7)*49),w=17+Math.floor(hash(i+4)*13);rect(f,x,174-h,w,h,p.far);rect(f,x+w-4,174-h,4,h,p.farSide);rect(f,x+3,170-h,w-7,4,p.far);if(i%5===0)rect(f,x+8,159-h,2,15,p.farSide);for(let y=179-h;y<166;y+=9)for(let k=3;k<w-4;k+=7)if(hash(i*73+y+k)>.5)rect(f,x+k,y,2,3,mode==='dusk'?'#c19c91':'#abc0ad');}
    // A repeatable street of individually detailed, original pixel buildings.
    for(let i=0;i<25;i++){
      const x=i*83-12,w=57+Math.floor(hash(i+55)*20),h=68+Math.floor(hash(i+17)*69),top=200-h;
      rect(m,x,top,w,h,p.wall[i%5]);rect(m,x+w-12,top,12,h,p.side);
      rect(m,x-3,top-5,w+6,5,p.roof);rect(m,x,top,w-12,3,p.horizon);
      rect(m,x+7,top-12,20,7,p.side);rect(m,x+9,top-14,17,2,p.roof);
      if(i%3===0){rect(m,x+w-19,top-24,1,20,p.shadow);rect(m,x+w-27,top-21,16,1,p.shadow);}
      for(let row=0;row<Math.floor((h-30)/22);row++)for(let col=0;col<3;col++){
        const wx=x+7+col*14,wy=top+11+row*22,lit=hash(i*91+row*17+col)>.28;
        rect(m,wx-1,wy-1,10,14,p.side);rect(m,wx,wy,8,11,lit?p.window:p.darkWindow);
        rect(m,wx+4,wy,1,11,p.side);rect(m,wx,wy+6,8,1,p.side);rect(m,wx-2,wy+12,12,2,p.roof);
        if(mode==='dusk'&&lit)rect(m,wx+1,wy+1,2,4,'#ffe1a4');
      }
      rect(m,x+4,180,w-22,20,p.shadow);rect(m,x+7,183,13,17,p.window);rect(m,x+23,183,15,13,p.window);
      rect(m,x+12,183,1,17,p.side);rect(m,x+29,183,1,13,p.side);
      // Shop awning, tiny sign, potted plant and drain pipe.
      rect(m,x+1,175,w-17,5,p.roof);for(let k=0;k<w-17;k+=8)rect(m,x+1+k,175,4,7,p.accent);
      rect(m,x+7,164,25,7,p.roof);rect(m,x+10,166,4,2,p.cloud);rect(m,x+16,166,10,2,p.cloud);
      rect(m,x+w-5,top+5,2,h-5,p.shadow);rect(m,x+40,194,6,6,p.accent);rect(m,x+41,187,4,7,p.tree);
      if(i%2===0){rect(m,x+w-2,top+39,13,20,p.roof);rect(m,x+w,top+42,9,14,p.accent);rect(m,x+w+3,top+45,2,8,p.cloud);}
      if(i%3===1)tree(m,x+w+7,154,p,1);
    }
    rect(m,0,201,2048,4,p.shadow);rect(m,0,205,2048,19,p.street);
    for(let x=0;x<2048;x+=20)rect(m,x,210,11,1,p.horizon);
    // Foreground plants, lamp posts, fence and overhead cable.
    for(let x=0;x<1024;x+=15){rect(n,x,216,2,8,p.shadow);rect(n,x,217,15,1,p.shadow);}
    [102,514,913].forEach((x,i)=>{rect(n,x,47,3,177,p.shadow);rect(n,x-7,42,18,5,p.shadow);rect(n,x-6,47,16,3,p.roof);rect(n,x-4,46,12,3,mode==='dusk'?'#ffe1a0':p.cloud);rect(n,x+1,49,1,171,p.side);rect(n,x-2,218,7,6,p.shadow);if(i===1){rect(n,x-3,104,27,17,p.shadow);rect(n,x,107,21,11,p.accent);rect(n,x+4,111,11,2,p.cloud);}});
    tree(n,315,137,p,2);tree(n,760,147,p,2);
    for(let x=0;x<1024;x+=2){const y=23+Math.round(8*Math.sin(x/164));rect(n,x,y,2,1,p.shadow);}
    return {far,middle,near};
  }
  const urban=window.createUrbanCity(c);
  let scenery=makeLayers();
  function repeat(img,offset){const x=-Math.floor(offset%img.width);c.drawImage(img,x,0);c.drawImage(img,x+img.width,0);}
  function world(){const p=colors[mode];rect(c,0,0,528,224,p.sky);rect(c,0,67,528,57,p.horizon);rect(c,0,124,528,100,p.hill);
    // Pixel sunset and long, horizontal clouds.
    rect(c,383,17,29,43,p.sun);rect(c,376,24,43,29,p.sun);rect(c,380,20,35,37,p.sun);
    [[28,30,67],[143,14,50],[286,50,71],[459,28,46]].forEach(([x,y,w])=>{rect(c,x,y,w,3,p.cloud);rect(c,x+8,y-3,w-18,3,p.cloud);rect(c,x-5,y+3,w+12,2,p.cloud);});
    if(mode==='dusk')[[82,12],[245,22],[477,8],[323,9]].forEach(([x,y])=>rect(c,x,y,1,1,p.sun));
    if(score){
      c.save();c.translate(0,-12);c.scale(1,.76);repeat(scenery.far,distance*.13);c.restore();
      urban.draw(p,mode);
      // Nearby carriage-side fence moves faster than the entire city panorama.
      const fenceOffset=Math.floor(distance*1.15)%24;
      rect(c,0,219,528,2,p.shadow);for(let x=-fenceOffset;x<528;x+=24)rect(c,x,218,2,6,p.shadow);
    }else{repeat(scenery.far,distance*.13);repeat(scenery.middle,distance*.55);repeat(scenery.near,distance*1.15);}
  }
  function frame(){
    rect(c,0,0,640,360,'#173d31');rect(c,0,0,640,8,'#214b39');rect(c,0,9,640,1,'#315442');
    // Carriage seams and pixel-grained paint: fixed and deterministic.
    for(let i=0;i<500;i++){const x=Math.floor(hash(i+801)*640),y=Math.floor(hash(i+1602)*360);rect(c,x,y,1,1,i%2?'#1c4234':'#15392e');}
    rect(c,20,0,2,292,'#0e3027');rect(c,617,0,2,292,'#0d3026');rect(c,24,0,1,292,'#2c503c');
    // Stepped corners give the train window its pixel silhouette.
    poly(c,[[53,31],[587,31],[587,35],[598,35],[598,44],[604,44],[604,279],[598,279],[598,288],[587,288],[587,292],[53,292],[53,288],[42,288],[42,279],[36,279],[36,44],[42,44],[42,35],[53,35]],'#0a251f');
    poly(c,[[55,34],[585,34],[585,38],[595,38],[595,46],[600,46],[600,277],[595,277],[595,285],[585,285],[585,288],[55,288],[55,285],[45,285],[45,277],[40,277],[40,46],[45,46],[45,38],[55,38]],'#7f9375');
    rect(c,55,37,530,3,'#bbc2a0');rect(c,43,48,3,223,'#a8b291');rect(c,595,48,3,224,'#4d6851');rect(c,54,280,532,5,'#435e48');
    rect(c,50,43,540,234,'#233b30');rect(c,53,46,534,228,'#0b211e');
    c.save();c.beginPath();c.rect(56,49,528,224);c.clip();c.translate(56,49);world();
    // Minimal glass reflections along the edges, retaining crisp scenery.
    c.globalAlpha=.045;poly(c,[[0,0],[35,0],[152,224],[120,224]],'#fff1d1');c.globalAlpha=.08;rect(c,0,0,528,3,'#fff1d1');c.restore();
    rect(c,47,286,546,4,'#96a080');rect(c,40,290,560,5,'#4c6b51');rect(c,39,295,562,5,'#0e2d25');
    // Seat edge and one quietly personal object: a pocket notebook.
    rect(c,0,306,640,54,'#123328');rect(c,0,311,640,3,'#49614a');rect(c,0,316,640,44,'#214837');
    for(let x=8;x<640;x+=24){rect(c,x,320,1,40,'#183d2f');rect(c,x+2,320,1,40,'#2b503b');}
    rect(c,0,351,640,9,'#102b23');rect(c,28,309,66,3,'#718268');
    const notebookActive=notebookHovered||notebookFocused;
    notebookLift+=((notebookActive&&!reduced.matches?4:0)-notebookLift)*.24;
    poly(c,[[487,319],[537,319],[553,338],[502,338]],'#0b2c25');
    c.save();c.translate(0,-Math.round(notebookLift));
    poly(c,[[485,314],[530,314],[547,331],[502,331]],notebookActive?'#d19477':'#b67961');poly(c,[[487,319],[502,334],[546,334],[546,331],[502,331]],'#d8c9a2');rect(c,502,335,44,2,'#714f43');
    poly(c,[[493,317],[510,317],[519,325],[502,325]],'#d4b28a');rect(c,527,317,2,10,'#754c43');
    if(notebookActive){rect(c,535,307,1,7,'#ecd8aa');rect(c,532,310,7,1,'#ecd8aa');}
    c.restore();
    c.font='6px monospace';c.textAlign='left';c.fillStyle='#b9c0a1';c.fillText('CITY OBSERVATORY',55,22);c.textAlign='right';c.fillStyle='#d5b28b';c.fillText('025 / WINDOW SEAT',585,22);c.textAlign='left';
    [48,589].forEach(x=>{rect(c,x,39,2,2,'#d1c9a6');rect(c,x,279,2,2,'#b6b997');});
  }
  function sync(){
    const active=moving&&!document.hidden&&windowVisible;
    urban.setActive(active&&score);
    if(!active&&animationId){cancelAnimationFrame(animationId);animationId=0;previous=0;}
    if(active&&!animationId)animationId=requestAnimationFrame(tick);
    if(windowVisible&&!document.hidden)frame();
  }
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;scenery=makeLayers();document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));frame();}));
  reduced.addEventListener('change',e=>{moving=!e.matches;sync();});
  if(notebookButton){
    const redrawNotebook=()=>{if(!animationId)frame();};
    notebookButton.addEventListener('pointerenter',()=>{notebookHovered=true;redrawNotebook();});
    notebookButton.addEventListener('pointerleave',()=>{notebookHovered=false;redrawNotebook();});
    notebookButton.addEventListener('focus',()=>{notebookFocused=true;redrawNotebook();});
    notebookButton.addEventListener('blur',()=>{notebookFocused=false;redrawNotebook();});
    notebookButton.addEventListener('click',()=>parent.postMessage({type:'city-window-open-notes'},location.origin));
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='city-window-notes-state')return;
      notebookButton.setAttribute('aria-expanded',String(event.data.open===true));
      if(event.data.returnFocus)notebookButton.focus({preventScroll:true});
    });
  }
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='city-window-active')return;windowVisible=event.data.active===true;previous=0;sync();});
  function tick(now){animationId=0;if(!moving||document.hidden||!windowVisible){previous=0;return;}const delta=previous?Math.min((now-previous)/1000,.05):0;previous=now;distance+=delta*16;if(score)urban.update(delta);frame();animationId=requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{previous=0;sync();});frame();sync();
})();
