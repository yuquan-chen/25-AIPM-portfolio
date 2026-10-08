(() => {
  'use strict';
  const frame=document.getElementById('openingCity'),reader=document.getElementById('researchReader');
  const trigger=document.getElementById('openResearch'),legacy=document.getElementById('researchSource');
  const spread=document.getElementById('readerSpread'),previous=document.getElementById('readerPrevious'),next=document.getElementById('readerNext'),position=document.getElementById('readerPosition');
  const titles=['如果城市是声音？','城市如何拥有声部','从元素到声音参数','把空间变成时间','结果与下一步','研究仍在继续'];
  const pages=Array.from({length:6},(_,index)=>{
    const source=legacy.content.querySelector(`[data-page="${index===5?'blank':index+1}"]`),body=document.createElement('div');
    body.className='reader-body';
    const addFigure=(image,caption)=>{
      const figure=document.createElement('figure'),copy=image.cloneNode(true),label=document.createElement('figcaption');
      copy.removeAttribute('class');copy.removeAttribute('style');label.textContent=caption;
      figure.append(copy,label);body.append(figure);
    };
    for(const child of source.children){
      if(child.matches('.city-page-copy,.city-method-lead,.city-result-copy,.city-result-limit,.city-method-source')){
        const copy=document.createElement('p');copy.innerHTML=child.innerHTML;
        if(child.matches('.city-method-source'))copy.className='reader-source';
        body.append(copy);
      }else if(child.matches('.city-method-grid')){
        child.querySelectorAll('.city-method-card').forEach(card=>addFigure(card.querySelector('img'),Array.from(card.querySelector('.city-method-card-label').childNodes).map(node=>node.textContent.trim()).filter(Boolean).join(' · ')));
      }else if(child.matches('.city-traversal-figure')){
        const image=child.querySelector('img');addFigure(image,image.alt);
      }else if(child.matches('.city-result-figure')){
        addFigure(child.querySelector('.city-result-city'),'城市建筑图层 · 研究过程中的视觉原型');
      }
    }
    if(index===5){const p=document.createElement('p');p.textContent='Urban Ensemble / 城市可听化';const link=document.createElement('a');link.href='./projects/city-sonification/index.html';link.textContent='查看完整项目 ↗';body.append(p,link);}
    return body;
  });
  let current=0,visible=true,turnTimer;
  function signalWindow(){frame.contentWindow?.postMessage({type:'city-window-active',active:visible&&!reader.open&&!document.hidden},location.origin);}
  function render(animate=false){
    spread.replaceChildren();
    for(let side=0;side<2;side++){
      const index=current*2+side,leaf=document.createElement('article'),header=document.createElement('header'),kicker=document.createElement('small'),title=document.createElement('h3'),count=document.createElement('div');
      leaf.className='reader-leaf';header.className='reader-chapter';kicker.textContent=`URBAN ENSEMBLE / ${String(index+1).padStart(2,'0')}`;title.textContent=titles[index];
      header.append(kicker,title);count.className='reader-page-number';count.textContent=`${String(index+1).padStart(2,'0')} / 06`;
      leaf.append(header,pages[index].cloneNode(true),count);spread.append(leaf);
    }
    previous.disabled=current===0;next.disabled=current===2;position.textContent=`${current+1} / 3`;
    reader.scrollTop=0;clearTimeout(turnTimer);spread.classList.remove('is-turning');
    if(animate){requestAnimationFrame(()=>spread.classList.add('is-turning'));turnTimer=setTimeout(()=>spread.classList.remove('is-turning'),320);}
  }
  trigger.addEventListener('click',()=>{current=0;render();reader.showModal();document.body.style.overflow='hidden';signalWindow();});
  document.getElementById('readerClose').addEventListener('click',()=>reader.close());
  reader.addEventListener('close',()=>{document.body.style.overflow='';signalWindow();trigger.focus({preventScroll:true});});
  previous.addEventListener('click',()=>{if(current>0){current--;render(true);}});
  next.addEventListener('click',()=>{if(current<2){current++;render(true);}});
  reader.addEventListener('keydown',event=>{if(event.key==='ArrowRight'&&current<2){event.preventDefault();current++;render(true);}if(event.key==='ArrowLeft'&&current>0){event.preventDefault();current--;render(true);}});
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow||event.data?.type!=='city-window-size')return;
    const height=Number(event.data.height);if(Number.isFinite(height)&&height>=100&&height<1000)frame.style.height=height+'px';
  });
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;signalWindow();},{threshold:.05}).observe(frame);
  frame.addEventListener('load',signalWindow);document.addEventListener('visibilitychange',signalWindow);
})();
