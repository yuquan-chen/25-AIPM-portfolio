(() => {
  const stack=document.getElementById('city-finance-turn');
  if(!stack)return;
  const city=document.getElementById('city-project'),finance=document.getElementById('finance-project');
  const frame=document.getElementById('chapterCity'),nav=document.querySelector('.cover-nav');
  const motion=matchMedia('(min-width:761px) and (prefers-reduced-motion:no-preference)');
  let pending=false,covered=false;
  const clamp=value=>Math.max(0,Math.min(1,value));
  function paint(){
    pending=false;
    const enabled=motion.matches,vh=innerHeight,navHeight=nav.offsetHeight;
    // Read the entire city chapter before pinning its lower edge for the handover.
    stack.style.setProperty('--city-pin-top',Math.min(navHeight,vh-city.offsetHeight-100)+'px');
    stack.classList.toggle('is-ready',enabled);
    const top=finance.getBoundingClientRect().top;
    const progress=clamp((vh-top)/(vh*.55));
    const overlap=clamp((vh-top)/(vh-navHeight));
    finance.style.setProperty('--turn-shadow',String(enabled?Math.sin(overlap*Math.PI)*.2:0));
    finance.style.setProperty('--turn-title-y',`${(1-progress)*14}px`);
    finance.style.setProperty('--turn-title-opacity',String(.72+progress*.28));
    const copy=clamp((progress-.12)/.88);
    finance.style.setProperty('--turn-copy-y',`${(1-copy)*20}px`);
    finance.style.setProperty('--turn-copy-opacity',String(.72+copy*.28));
    const bounds=frame.getBoundingClientRect();
    const nextCovered=enabled&&top<=Math.max(navHeight,bounds.top)+40;
    if(nextCovered!==covered){covered=nextCovered;window.dispatchEvent(new CustomEvent('chapter-city-occlusion',{detail:{covered}}));}
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(paint);}}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  motion.addEventListener('change',schedule);
  new ResizeObserver(schedule).observe(city);
  frame.addEventListener('load',schedule);document.fonts?.ready.then(schedule);
  paint();
})();
