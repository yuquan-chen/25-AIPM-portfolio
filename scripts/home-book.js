(() => {
  'use strict';
  const frame=document.getElementById('openingCity'),book=document.getElementById('cityBook'),cover=document.getElementById('bookCover'),interior=document.getElementById('bookInterior');
  const trigger=document.getElementById('openResearch'),close=document.getElementById('bookClose'),previous=document.getElementById('bookPrevious'),next=document.getElementById('bookNext');
  const title=document.getElementById('noteTitle'),body=document.getElementById('noteContent'),number=document.getElementById('noteNumber'),chapter=document.getElementById('noteChapter');
  const base='./projects/city-sonification/assets/';
  const figure=(path,alt,caption)=>`<figure><img src="${base+path}" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
  const pages=[
    {chapter:'01 / 想法的起点',title:'如果城市是声音？',html:'<p>我的专业是<strong>测绘工程</strong>，研究课题与城市有关；同时，我也一直喜欢声音。</p><p>偶然的一次路上，我突然想到：</p><p class="note-question">如果把一座城市做成声音，<br>它会是什么样子？</p><p>也许是城市高低起伏的轮廓，也许是通勤途中熟悉的一站，或是清晨的鸟鸣。我想从这些日常感受出发，尝试建立城市与声音之间的联系。</p>'},
    {chapter:'02 / 从数据开始',title:'先选一组能读懂的数据',html:'<p>我先选取 <strong>POI 与 OD 流</strong>，把城市里的功能与移动关系，组织成可以沿时间展开的声音事件。</p><dl class="note-mapping"><dt>POI</dt><dd>城市中的功能分布</dd><dt>OD</dt><dd>地点之间的移动关系</dd><dt>HILBERT</dt><dd>组织空间遍历的顺序</dd><dt>MIDI</dt><dd>记录转译后的声音事件</dd></dl><p>这一版先建立空间映射与时序关系，再逐步处理声音的表现。</p>'},
    {chapter:'03 / 声音建模',title:'让城市拥有不同声部',html:'<p>我借鉴 Adhitya 的研究，先把城市拆成不同系统，再为它们分配可以区分的<strong>听觉角色</strong>。</p>'+figure('research/urban-orchestra-level1.png','城市系统对应不同管弦乐声部的研究图','城市系统 → 管弦乐声部')+'<p>继续进入公园、河流等具体元素，用音高、响度、时值和音色描述它们。</p><p class="note-source">参考：Adhitya，《Sonifying Urban Rhythms》，2013，p.97–98。</p>'},
    {chapter:'04 / 城市序列化',title:'把空间变成时间',html:'<p>城市数据是静态的，声音却需要沿时间展开。我选择<strong>希尔伯特曲线</strong>，把空间单元组织成连续序列。</p>'+figure('research/hilbert-curve.png','希尔伯特曲线从低阶到高阶的空间填充过程','从低阶到高阶的空间遍历')+'<p>它尽量保持局部连续性，让空间相邻的单元，在声音序列中也尽量相邻。</p>'},
    {chapter:'05 / 当前结果',title:'先让空间关系被看见',html:figure('city-southeast.png','城市可听化研究中的城市建筑图层','研究中的城市建筑图层')+'<p>目前已完成<strong>空间映射与时序关系建模</strong>，并生成 MIDI 文件。</p><p>视觉原型把道路作为底层，再叠加建筑图层，用道路蒙版标记路网区域，为后续声音映射建立可见的空间入口。</p>'},
    {chapter:'06 / 反思与后续',title:'还需要继续做的部分',html:'<ul><li><strong>音色：</strong>MIDI 转换为真实音色后的听觉效果，仍需要打磨。</li><li><strong>界面：</strong>研究原型还需要形成更完整的可视化交互。</li><li><strong>人的路径：</strong>未来希望结合 Agent 与真实轨迹，把“一个人的一天”组织成一段声音。</li></ul><p class="note-source">封面的像素城镇是交互演绎，使用程序生成的场景与合成声景。</p><a class="note-project-link" href="./projects/city-sonification/index.html">阅读完整研究 ↗</a>'}
  ];
  let current=0,opened=false,visible=true,animation;
  function signalWindow(){frame.contentWindow?.postMessage({type:'city-window-active',active:visible&&!opened&&!document.hidden},location.origin);}
  function animate(kind){clearTimeout(animation);book.classList.remove('is-opening','is-closing','is-next','is-prev');requestAnimationFrame(()=>book.classList.add(kind));animation=setTimeout(()=>book.classList.remove(kind),460);}
  function render(){const page=pages[current];chapter.textContent=page.chapter;title.textContent=page.title;body.innerHTML=page.html;body.scrollTop=0;number.textContent=String(current+1).padStart(2,'0')+' / 06';previous.disabled=current===0;next.textContent=current===5?'合上笔记 ↗':'下一页 →';}
  function setOpen(value){opened=value;trigger.setAttribute('aria-expanded',String(value));cover.hidden=value;interior.hidden=!value;signalWindow();if(value){current=0;render();animate('is-opening');title.focus({preventScroll:true});}else{animate('is-closing');trigger.focus({preventScroll:true});}}
  function turn(delta){const target=current+delta;if(target<0)return;if(target>=pages.length){setOpen(false);return;}current=target;render();animate(delta>0?'is-next':'is-prev');title.focus({preventScroll:true});}
  trigger.addEventListener('click',()=>setOpen(true));close.addEventListener('click',()=>setOpen(false));previous.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
  interior.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();setOpen(false);}else if(event.key==='ArrowRight'){event.preventDefault();turn(1);}else if(event.key==='ArrowLeft'){event.preventDefault();turn(-1);}});
  window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==frame.contentWindow)return;if(event.data?.type==='city-window-open-notes'){setOpen(true);return;}if(event.data?.type!=='city-window-size')return;const height=Number(event.data.height);if(Number.isFinite(height)&&height>=100&&height<1000)frame.style.height=height+'px';});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;signalWindow();},{threshold:.05}).observe(book);
  frame.addEventListener('load',signalWindow);document.addEventListener('visibilitychange',signalWindow);
})();
