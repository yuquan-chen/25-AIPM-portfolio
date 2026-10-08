/* In-place research reader. The original portfolio remains available unchanged. */
(() => {
  'use strict';
  const base='./projects/city-sonification/assets/';
  const figure=(path,alt,caption)=>`<figure><img src="${base+path}" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
  const pages=[
    {label:'从数据开始',chapter:'01 / 数据',leftTitle:'先选一组<br>能读懂的数据。',left:`<p>我先从两类数据入手：<strong>POI 与 OD 流</strong>。</p><div class="note-definition"><h4>POI / 地点</h4><p>描述城市中的功能分布。先看一座城市里有什么。</p><h4>OD / 移动</h4><p>描述地点之间的移动关系。再看人如何连接这些地方。</p></div><p class="page-aside">先建立空间映射与时序关系，再处理声音的表现。</p>`,title:'从空间，到声音事件',html:`<ol class="research-route"><li><span>01</span><div><h4>读取城市</h4><p>POI 与 OD 流<br>功能分布 · 移动关系</p></div></li><li><span>02</span><div><h4>组织顺序</h4><p>希尔伯特曲线<br>让空间单元沿时间展开</p></div></li><li><span>03</span><div><h4>记录声音事件</h4><p>MIDI<br>承载转译后的声音信息</p></div></li></ol><p class="note-source">研究流程示意。具体的声音映射仍需要结合数据逐步打磨。</p>`},
    {label:'声音建模',chapter:'02 / 声部',leftTitle:'让不同的城市系统，<br>拥有不同声部。',left:`<p>我借鉴 Adhitya 的研究，先把城市拆成不同系统，再为它们分配可以区分的<strong>听觉角色</strong>。</p><p>自然环境、交通、城市活动、建筑形态与设计元素，可以像管弦乐队里的不同声部一样，共同组成一座“城市乐团”。</p><p>再进入公园、河流等具体元素，用音高、响度、时值与音色描述它们。</p><p class="page-aside">我关注的是：这些空间关系，能不能被耳朵辨认出来。</p>`,title:'一座城市，一支乐团',html:`<div class="orchestra-head"><span>城市系统</span><span>乐器声部</span></div><dl class="orchestra-map"><div><dt>自然环境<small>Environment</small></dt><dd>铜管<small>Brass</small></dd></div><div><dt>交通系统<small>Transportation</small></dt><dd>弦乐<small>Strings</small></dd></div><div><dt>城市活动<small>Urban activities</small></dt><dd>木管<small>Woodwind</small></dd></div><div><dt>城市形态<small>Urban form</small></dt><dd>有调打击乐<small>Tuned percussion</small></dd></div><div><dt>城市设计<small>Urban design</small></dt><dd>打击乐<small>Percussion</small></dd></div></dl>`+figure('research/urban-orchestra-level1.png','Adhitya 研究中的城市系统与管弦乐声部对应关系原图','原文图表 · Table 8.1 / Urban System × Instrumental Section')+`<p class="note-source">据 Adhitya，《Sonifying Urban Rhythms》，2013，表 8.1 重排。这里是参考框架，并非本项目已完成的全部映射。 <a href="${base}research/urban-orchestra-level1.png" target="_blank" rel="noopener">查看原图 ↗</a></p>`},
    {label:'城市序列化',chapter:'03 / 顺序',leftTitle:'把空间，<br>慢慢展开成时间。',left:`<p>城市数据是静态的，声音却需要沿时间展开。</p><p>我选择<strong>希尔伯特曲线</strong>，把空间单元组织成连续序列。它尽量保持局部连续性，让空间中相邻的单元，在声音序列中也尽量相邻。</p><p>这样，城市就有了一条可以依次读取的路径。</p><p class="page-aside">空间里的“附近”，也尽量成为声音里的“接下来”。</p>`,title:'一条不断细分的路径',html:figure('research/hilbert-curve.png','希尔伯特曲线由低阶到高阶的空间遍历示意','希尔伯特曲线 / 从低阶到高阶')+`<div class="sequence-caption"><span>空间单元</span><b>→</b><span>遍历顺序</span><b>→</b><span>声音序列</span></div><p>这一步解决先读哪里、再读哪里的顺序问题。</p>`},
    {label:'反思与后续',chapter:'04 / 继续',leftTitle:'这次尝试，<br>还有未完成的部分。',left:`<p>从空间关系到声音，并不是完成一次格式转换就结束了。</p><div class="note-definition"><h4>音色，还需要打磨</h4><p>MIDI 转换为真实音色后，听觉效果还需要反复调整。</p><h4>界面，还需要完善</h4><p>研究原型需要形成更完整的可视化交互，让空间与声音的关系更容易理解。</p></div>`,title:'再靠近一个人的日常',html:`<p class="next-question">如果把一个人的一天，<br>也变成一段声音呢？</p><p>未来希望结合 Agent 与真实轨迹，把人的路径组织成声音，让“这一天如何经过一座城市”也能被听见。</p><p class="page-aside">窗外的像素城镇，是这个想法的一次交互演绎；场景与声景由程序合成。</p><a class="note-project-link" href="./projects/city-sonification/index.html">阅读完整研究 ↗</a>`}
  ];

  const reader=document.getElementById('research-reader');
  const trigger=document.getElementById('revealResearch');
  const close=document.getElementById('closeResearch');
  const book=reader.querySelector('.research-book');
  const title=document.getElementById('research-title');
  const content=document.getElementById('research-content');
  const chapter=document.getElementById('research-chapter');
  const counter=document.getElementById('research-number');
  const previous=document.getElementById('research-previous');
  const next=document.getElementById('research-next');
  const sectionSelect=document.getElementById('research-section');
  const leftTitle=document.getElementById('research-left-title');
  const leftContent=document.getElementById('research-left-content');
  pages.forEach((page,i)=>sectionSelect.add(new Option(String(i+1).padStart(2,'0')+' · '+page.label,i)));
  const frame=document.getElementById('chapterCity');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');

  const stage=reader.querySelector('.book-stage');
  const cover=reader.querySelector('.book-front-cover');
  const leftLeaf=reader.querySelector('.research-margin');
  const leaf=reader.querySelector('.research-page');
  let current=0,visible=false,openedFromNotebook=false,phase='closed',turning=false;
  let savedOverflow='',savedPadding='',returnElement=null;
  const run=async(el,frames,duration)=>{
    const motion=el.animate(frames,{duration:reduced.matches?1:duration,easing:'cubic-bezier(.25,.65,.25,1)',fill:'forwards'});
    await motion.finished;motion.commitStyles();motion.cancel();
  };
  function paint(index){
    current=index;const page=pages[current];
    chapter.textContent='URBAN ENSEMBLE';title.textContent=page.title;
    leftTitle.innerHTML=page.leftTitle;leftContent.innerHTML=page.left;leftContent.scrollTop=0;
    document.getElementById('research-left-chapter').textContent=page.chapter;
    document.getElementById('research-left-number').textContent=String(current*2+1).padStart(2,'0');
    content.innerHTML='<div class="mobile-note-intro"><h4>'+page.leftTitle+'</h4>'+page.left+'</div>'+page.html;content.scrollTop=0;
    sectionSelect.value=String(current);leaf.dataset.layout=page.label==='城市序列化'?'sequence':'text';
    counter.innerHTML='<span class="desktop-folio">'+String(current*2+2).padStart(2,'0')+' / '+String(pages.length*2).padStart(2,'0')+'</span><span class="mobile-folio">'+String(current+1).padStart(2,'0')+' / '+String(pages.length).padStart(2,'0')+'</span>';
    previous.disabled=current===0;next.disabled=current===pages.length-1;

  }
  // Turn a two-sided sheet about the spine; the incoming page is already underneath.
  async function turn(index){
    if(phase!=='open'||turning||index===current||index<0||index>=pages.length)return;
    turning=true;const forward=index>current;
    const old=leaf.cloneNode(true);paint(index);const fresh=leaf.cloneNode(true);
    const sheet=document.createElement('div');sheet.className='turning-sheet';sheet.setAttribute('aria-hidden','true');sheet.inert=true;
    const front=forward?old:fresh;front.classList.add('sheet-front');
    const back=document.createElement('div');back.className='sheet-back';back.innerHTML='<span>URBAN ENSEMBLE</span><i>城市与声音</i>';
    front.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));front.removeAttribute('aria-labelledby');
    sheet.append(front,back);book.append(sheet);
    await run(sheet,[{transform:forward?'rotateY(0deg)':'rotateY(-180deg)'},{transform:forward?'rotateY(-180deg)':'rotateY(0deg)'}],720);
    sheet.remove();turning=false;title.focus({preventScroll:true});
  }
  function originTransform(){
    const target=stage.getBoundingClientRect();let rect=trigger.getBoundingClientRect();
    try{
      const c=frame.contentDocument.getElementById('city').getBoundingClientRect();const f=frame.getBoundingClientRect();
      rect={left:f.left+c.left+c.width*485/640,top:f.top+c.top+c.height*314/360,width:c.width*62/640,height:c.height*23/360};
    }catch{}
    const mobile=matchMedia('(max-width:780px)').matches;
    const x=target.left+target.width*(mobile?.5:.75),y=target.top+target.height/2;
    return `translate(${rect.left+rect.width/2-x}px,${rect.top+rect.height/2-y}px) scale(${rect.width/(target.width*(mobile?1:.5))},${rect.height/target.height}) rotate(-5deg)`;
  }
  async function openBook(){
    if(phase!=='closed')return;
    phase='opening';reader.dataset.phase=phase;returnElement=document.activeElement;
    savedOverflow=document.body.style.overflow;savedPadding=document.body.style.paddingRight;
    const gutter=innerWidth-document.documentElement.clientWidth;
    document.body.style.paddingRight=gutter+'px';document.body.style.overflow='hidden';
    paint(current);cover.style.visibility='visible';cover.style.transform='rotateY(0deg)';
    leftLeaf.style.transform='rotateY(180deg)';
    stage.style.transform='none';reader.showModal();trigger.setAttribute('aria-expanded','true');signal();
    frame.contentWindow?.postMessage({type:'city-window-notes-state',open:true},location.origin);
    const start=originTransform();stage.style.transform=start;
    await run(stage,[{transform:start},{transform:'none'}],550);
    reader.dataset.phase='unfolding';
    // The inside page and outside cover are opposite faces of the same hinged leaf.
    await Promise.all([
      run(cover,[{transform:'rotateY(0deg)'},{transform:'rotateY(-180deg)'}],800),
      run(leftLeaf,[{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],800)
    ]);
    cover.style.visibility='hidden';phase='open';reader.dataset.phase=phase;title.focus({preventScroll:true});
  }
  async function closeBook(){
    if(phase!=='open'||turning)return;
    phase='closing';reader.dataset.phase=phase;cover.style.visibility='visible';
    await Promise.all([
      run(cover,[{transform:'rotateY(-180deg)'},{transform:'rotateY(0deg)'}],800),
      run(leftLeaf,[{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],800)
    ]);
    reader.dataset.phase='returning';
    await run(stage,[{transform:'none'},{transform:originTransform()}],500);
    reader.close();phase='closed';reader.dataset.phase=phase;
    document.body.style.overflow=savedOverflow;document.body.style.paddingRight=savedPadding;
    trigger.setAttribute('aria-expanded','false');signal();
    if(!openedFromNotebook)returnElement?.focus({preventScroll:true});
    frame.contentWindow?.postMessage({type:'city-window-notes-state',open:false,returnFocus:openedFromNotebook},location.origin);
  }
  trigger.addEventListener('click',()=>{openedFromNotebook=false;openBook();});
  close.addEventListener('click',closeBook);
  reader.addEventListener('cancel',event=>{event.preventDefault();closeBook();});
  reader.addEventListener('click',event=>{if(event.target===reader)closeBook();});
  previous.addEventListener('click',()=>turn(current-1));next.addEventListener('click',()=>turn(current+1));
  sectionSelect.addEventListener('change',()=>{const target=Number(sectionSelect.value);if(phase==='open'&&!turning)turn(target);else sectionSelect.value=String(current);});
  reader.addEventListener('keydown',event=>{
    if(event.key==='ArrowRight'){event.preventDefault();turn(current+1);}
    if(event.key==='ArrowLeft'){event.preventDefault();turn(current-1);}
  });
  function signal(){frame.contentWindow?.postMessage({type:'city-window-active',active:visible&&!document.hidden&&phase==='closed'},location.origin);}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;signal();},{threshold:.05}).observe(frame);
  frame.addEventListener('load',signal);document.addEventListener('visibilitychange',signal);
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
    if(event.data?.type==='city-window-open-notes'){openedFromNotebook=true;openBook();return;}
    if(event.data?.type!=='city-window-size')return;
    const height=Number(event.data.height);if(Number.isFinite(height)&&height>=100&&height<1600)frame.style.height=height+'px';
  });
})();
