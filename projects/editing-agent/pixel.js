(() => {
  'use strict';
  const root=document.documentElement,params=new URLSearchParams(location.search);
  let saved='paper';try{saved=localStorage.getItem('charles-finance-style')||'paper';}catch{}
  const apply=style=>{root.dataset.financeStyle=style==='pixel'?'pixel':'paper';document.querySelectorAll('[data-cut-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cutStyle===root.dataset.financeStyle)));document.querySelector('.top-note').textContent=(style==='pixel'?'像素':'手绘')+'工作台 / 交互 Mock';};
  apply(params.get('style')||saved);
  document.querySelectorAll('[data-cut-style]').forEach(button=>button.onclick=()=>{const style=button.dataset.cutStyle;apply(style);if(parent!==window)parent.postMessage({type:'editing-style-request',style},location.origin);else{try{localStorage.setItem('charles-finance-style',style);}catch{}const url=new URL(location.href);url.searchParams.set('style',style);history.replaceState(null,'',url);}});
  window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='editing-style'&&['pixel','paper'].includes(e.data.style))apply(e.data.style);});
  if(parent!==window)parent.postMessage({type:'editing-style-ready'},location.origin);
  // The story renderer shares the editing clock and survives skin switches.
})();
