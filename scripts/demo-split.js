(() => {
  'use strict';
  const desktop=matchMedia('(min-width:761px)');
  document.querySelectorAll('#financePreview .finance-replay-layout,#replay .workspace,#workbench .desk').forEach(layout=>{
    if(layout.classList.contains('demo-split'))return;
    const first=layout.querySelector(':scope > .finance-chat,:scope > .conversation');if(!first)return;
    layout.classList.add('demo-split');
    const handle=document.createElement('div');handle.className='demo-split-handle';handle.tabIndex=0;handle.setAttribute('role','separator');handle.setAttribute('aria-label','调整对话与展示区域宽度');handle.setAttribute('aria-orientation','vertical');handle.setAttribute('aria-valuemin','32');handle.setAttribute('aria-valuemax','62');handle.title='拖动调整宽度 · 双击恢复默认 · 方向键微调';layout.append(handle);
    let ratio=47,dragging=false;
    const position=()=>{if(!desktop.matches)return;layout.style.setProperty('--demo-seam',(first.offsetLeft+first.offsetWidth-12)+'px');};
    function apply(value){ratio=Math.max(32,Math.min(62,value));layout.style.setProperty('--demo-columns',`minmax(0,${ratio}fr) minmax(0,${100-ratio}fr)`);handle.setAttribute('aria-valuenow',String(Math.round(ratio)));handle.setAttribute('aria-valuetext',`对话 ${Math.round(ratio)}%，展示 ${Math.round(100-ratio)}%`);position();}
    function move(e){const bounds=layout.getBoundingClientRect();const style=getComputedStyle(layout),left=parseFloat(style.paddingLeft)||0,right=parseFloat(style.paddingRight)||0,gap=parseFloat(style.columnGap)||0;apply((e.clientX-bounds.left-left+12)/(bounds.width-left-right-gap)*100);}
    handle.addEventListener('pointerdown',e=>{if(!desktop.matches||e.button!==0)return;e.preventDefault();dragging=true;handle.setPointerCapture(e.pointerId);document.documentElement.classList.add('demo-resizing');});
    handle.addEventListener('pointermove',e=>{if(dragging)move(e);});
    const stop=()=>{dragging=false;document.documentElement.classList.remove('demo-resizing');};
    handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);handle.addEventListener('lostpointercapture',stop);
    handle.addEventListener('dblclick',()=>apply(47));
    handle.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();apply(ratio+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?5:1));}else if(e.key==='Home'){e.preventDefault();apply(47);}});
    new ResizeObserver(position).observe(first);desktop.addEventListener('change',()=>{stop();position();});apply(47);
  });
})();
