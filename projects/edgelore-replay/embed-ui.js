// Compact panels share the existing live conversation and memory state.
(() => {
  const memory=document.querySelector('.memory'),memoryWindow=document.createElement('div');
  memoryWindow.className='memory-window';
  memoryWindow.append(memory.querySelector('.pane-head'),memory.querySelector('.memory-toolbar'),memory.querySelector('.atlas'));
  memory.prepend(memoryWindow);
  if(window.parent===window)return;
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='edgelore-appearance')return;
    document.documentElement.dataset.lightMode=e.data.mode==='night'?'night':'day';
    document.documentElement.dataset.financeStyle=e.data.style==='pixel'?'pixel':'paper';
    const height=Number(e.data.height);if(Number.isFinite(height)&&height>=500&&height<=900)document.documentElement.style.setProperty('--ex-body',height+'px');
  });
  const chapters=document.querySelector('.chapters');chapters.hidden=true;
  const picker=document.createElement('select');picker.className='replay-position';picker.setAttribute('aria-label','选择回放轮次');
  for(let n=0;n<=26;n++){
    const option=document.createElement('option');option.value=n;
    option.textContent=n===0?'从头开始':n<=22?`第 ${String(n).padStart(2,'0')} 轮 · ${n<6?'案例竞赛':n<12?'数据挖掘':n<18?'营销研究':'学术交流'}`:n===23?'跨会话提问':n===24?'续篇 · 建立记忆':n===25?'续篇 · 预算冲突':'续篇 · 负责人冲突';
    picker.append(option);
  }
  document.querySelector('.conversation .pane-head').append(picker);
  const scrub=document.getElementById('scrub');scrub.hidden=true;
  picker.addEventListener('change',()=>{scrub.value=picker.value;scrub.dispatchEvent(new Event('input',{bubbles:true}));});
  const footer=document.querySelector('.playback');footer.classList.add('demo-shell-footer');
  const caption=document.createElement('span');caption.className='replay-footer-caption';caption.append(document.getElementById('progress-label'),document.createTextNode(' · 记忆回放'));
  const actions=document.createElement('div');actions.append(document.getElementById('play'),document.getElementById('reset'));
  footer.replaceChildren(caption,actions,scrub);
  new MutationObserver(()=>{picker.value=Math.min(26,Number(scrub.value));document.body.dataset.replayStart=String(Number(scrub.value)===0);}).observe(document.getElementById('progress-label'),{childList:true,characterData:true,subtree:true});
  const workspace=document.querySelector('.workspace');
  const switcher=document.createElement('div');switcher.className='embed-view-switch';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','演示视图');
  const chat=document.createElement('button'),memoryButton=document.createElement('button');
  chat.type=memoryButton.type='button';chat.textContent='对话';memoryButton.textContent='记忆图 · 0';
  document.querySelector('.conversation').id='embed-conversation';document.querySelector('.memory').id='embed-memory';
  chat.setAttribute('aria-controls','embed-conversation');memoryButton.setAttribute('aria-controls','embed-memory');
  const select=panel=>{document.body.dataset.embedPanel=panel;chat.setAttribute('aria-pressed',String(panel==='chat'));memoryButton.setAttribute('aria-pressed',String(panel==='memory'));};
  chat.addEventListener('click',()=>select('chat'));memoryButton.addEventListener('click',()=>select('memory'));
  switcher.append(chat,memoryButton);workspace.before(switcher);select('chat');
  const count=document.getElementById('memory-count');
  new MutationObserver(()=>{memoryButton.textContent='记忆图 · '+count.textContent;}).observe(count,{childList:true,characterData:true,subtree:true});
  const prompt=document.getElementById('next-message');
  const fitPrompt=()=>{
    prompt.style.height='0px';
    const maximum=parseFloat(getComputedStyle(prompt).maxHeight);
    prompt.style.height=Math.min(prompt.scrollHeight,maximum)+'px';
  };
  // Replay updates the readonly prompt before the turn counter and label.
  new MutationObserver(fitPrompt).observe(document.querySelector('.composer-actions'),{childList:true,characterData:true,subtree:true});
  let previousWidth=0;
  new ResizeObserver(entries=>{
    const width=entries[0].contentRect.width;
    if(width!==previousWidth){previousWidth=width;fitPrompt();}
  }).observe(document.querySelector('.composer'));
  fitPrompt();
})();
