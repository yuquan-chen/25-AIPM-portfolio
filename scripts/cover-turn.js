/* Normal page scrolling drives a single opening transition, in both directions. */
(() => {
  const stack=document.getElementById('cover-index-turn');
  if(!stack)return;
  const cover=stack.querySelector('.cover'),index=stack.querySelector('.contents-sheet');
  const nav=document.querySelector('.cover-nav');
  const motion=matchMedia('(min-width:761px) and (prefers-reduced-motion:no-preference)');
  let pending=false;
  const clamp=value=>Math.max(0,Math.min(1,value));
  function paint(){
    pending=false;
    const vh=innerHeight,enabled=motion.matches;
    // Short viewports finish reading the cover before its lower edge pauses.
    stack.style.setProperty('--cover-pin-top',Math.min(0,vh-cover.offsetHeight)+'px');
    stack.classList.toggle('is-ready',enabled);
    const top=index.getBoundingClientRect().top;
    const overlap=clamp((vh-top)/Math.max(1,vh-nav.offsetHeight));
    const progress=clamp((vh-top)/(vh*.48));
    const copy=clamp((progress-.12)/.88);
    stack.style.setProperty('--cover-turn-shadow',String(enabled?Math.sin(overlap*Math.PI)*.17:0));
    stack.style.setProperty('--cover-title-y',`${(1-progress)*14}px`);
    stack.style.setProperty('--cover-title-opacity',String(.8+progress*.2));
    stack.style.setProperty('--cover-copy-y',`${(1-copy)*18}px`);
    stack.style.setProperty('--cover-copy-opacity',String(.8+copy*.2));
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  motion.addEventListener('change',schedule);
  const resize=new ResizeObserver(schedule);resize.observe(cover);resize.observe(index);
  document.fonts?.ready.then(schedule);
  paint();
})();
