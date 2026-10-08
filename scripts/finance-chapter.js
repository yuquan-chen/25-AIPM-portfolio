(() => {
  const frame=document.getElementById('chapterFinance');
  if(!frame)return;
  let visible=false;
  const signal=()=>frame.contentWindow?.postMessage({type:'finance-chapter-active',active:visible&&!document.hidden},location.origin);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;signal();},{threshold:.01}).observe(frame);
  frame.addEventListener('load',signal);document.addEventListener('visibilitychange',signal);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='finance-chapter-size')return;
    const height=Number(event.data.height);
    if(Number.isFinite(height)&&height>100&&height<2400)frame.style.height=height+'px';
  });
})();
