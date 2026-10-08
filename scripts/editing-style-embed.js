(() => {
  const frame=document.getElementById('editingSketch');if(!frame)return;
  const send=()=>frame.contentWindow?.postMessage({type:'editing-style',style:document.documentElement.dataset.financeStyle==='pixel'?'pixel':'paper'},location.origin);
  frame.addEventListener('load',send);
  new MutationObserver(send).observe(document.documentElement,{attributes:true,attributeFilter:['data-finance-style']});
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow)return;if(e.data?.type==='editing-style-ready'||e.data?.type==='editing-style-request')send();});
  send();
})();
