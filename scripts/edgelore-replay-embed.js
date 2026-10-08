(() => {
 const frame=document.getElementById('edgeloreReplay');if(!frame)return;
 let visible=false;
 const notify=()=>frame.contentWindow?.postMessage({type:'edgelore-replay-visible',visible:visible&&!document.hidden},location.origin);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;notify();},{threshold:.01}).observe(frame);
 frame.addEventListener('load',notify);document.addEventListener('visibilitychange',notify);
 let lastTheme='',lastStyle='',lastHeight=0,pendingScene=null;
 const syncAppearance=()=>{
   const mode=document.documentElement.dataset.lightMode==='night'?'night':'day';
   const style=document.documentElement.dataset.financeStyle==='pixel'?'pixel':'paper';
   const height=window.innerWidth>760?818:Math.max(600,Math.min(680,window.innerHeight-180));
   document.documentElement.style.setProperty('--ex-body',height+'px');
   if(mode===lastTheme&&style===lastStyle&&height===lastHeight)return;
   lastTheme=mode;lastStyle=style;lastHeight=height;
   frame.contentWindow?.postMessage({type:'edgelore-appearance',mode,style,height},location.origin);
 };
 frame.addEventListener('load',()=>{lastTheme='';syncAppearance();});
 window.addEventListener('coverlightchange',syncAppearance);window.addEventListener('resize',syncAppearance);syncAppearance();
 const sendScene=()=>{if(pendingScene===null)return;frame.contentWindow?.postMessage({type:'edgelore-scene',turn:pendingScene},location.origin);};
 document.querySelectorAll('[data-edgelore-scene]').forEach(button=>button.addEventListener('click',()=>{
   pendingScene=Number(button.dataset.edgeloreScene);sendScene();
   frame.closest('.edgelore-exhibit').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 }));
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='edgelore-ready'){lastTheme='';syncAppearance();sendScene();}if(e.data?.type==='edgelore-scene-applied')pendingScene=null;});
 window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='edgelore-replay-size')return;const h=Number(e.data.height);if(Number.isFinite(h)&&h>300&&h<5000)frame.style.height=Math.ceil(window.innerWidth>760?Math.min(h,866):h)+'px';});
})();
