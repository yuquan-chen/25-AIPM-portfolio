(() => {
  'use strict';
  const $=id=>document.getElementById(id), bench=$('workbench');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const edits={title:{request:'开头加一个标题：「胖猫的减肥大计」。',reply:'标题放在开头三秒，先交代主角，结尾再揭晓反转。',label:'写入标题',time:.8},text:{request:'在锻炼时加字幕：「再坚持一下！」。',reply:'在 00:06—00:08 的跑步画面下方加字幕，保留其他镜头。',label:'添加字幕',time:6.5},transition:{request:'梦醒的那一刻，闪白一下再回到床上。',reply:'在梦醒的镜头交界加半秒闪白，让成功与现实形成反差。',label:'添加转场',time:12.1},bgm:{request:'换一段诙谐的 BGM，画面不用动。',reply:'只替换声音轨道，保留全部镜头和文字。用诙谐的小节拍试一版。',label:'替换 BGM',time:5}};
  let state='idle', operation=null, elapsed=0, last=0, buildIndex=-1, time=0, playing=false, version=0, loose=false, selectedEdit=null;
  const applied=new Set();
  const textClips=[];
  const shots=()=>[{name:'胖猫日常',from:0,to:loose?3.5:3,asset:0},{name:'上秤立志',from:loose?3.5:3,to:5,asset:1},{name:'努力锻炼',from:5,to:8,asset:2},{name:'瘦身成功',from:8,to:loose?11.5:12,asset:3},{name:'梦醒反转',from:loose?11.5:12,to:15,asset:4}];
  const setMode=mode=>{state=mode;bench.dataset.mode=mode;};
  const status=(text,helper)=>{$('editorStatus').textContent=text;$('bottomStatus').textContent=text;};
  function message(type,text){if(type==='user')$('messages').querySelector('.welcome')?.remove();const el=document.createElement('article');el.className='message '+type;const meta=document.createElement('small');meta.textContent=type==='user'?'你':'剪辑助手';const p=document.createElement('p');p.textContent=text;el.append(meta,p);$('messages').append(el);$('messages').scrollTop=$('messages').scrollHeight;}
  function controls(){const busy=!!operation;const canPlay=version>0&&!busy;document.querySelector('.timeline-ruler').setAttribute('aria-disabled',String(!canPlay)); $('play').disabled=!canPlay;$('export').disabled=!canPlay;$('scrub').disabled=!canPlay;$('send').disabled=state!=='idle'&&!(state==='ready'&&selectedEdit);$('followups').hidden=state!=='ready';document.querySelectorAll('[data-edit]').forEach(b=>{b.disabled=applied.has(b.dataset.edit);b.setAttribute('aria-pressed',String(selectedEdit===b.dataset.edit));});$('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'暂停预览':'播放预览');}
  function propose(){operation=null;$('inputHint').textContent='提案已准备好，等你确认。';setMode('approval');status(selectedEdit?'这次改动，等你确认。':'五个镜头，等你确认。','你点头，我再动。');
    const card=document.createElement('div');card.className='proposal';
    const title=document.createElement('strong');title.textContent=selectedEdit?'本次修改提案':'候选 A · 15 秒';card.append(title);
    if(selectedEdit){const p=document.createElement('p');p.textContent=edits[selectedEdit].reply;card.append(p);}else{const list=document.createElement('ol');shots().forEach(s=>{const li=document.createElement('li');li.textContent=s.name;const t=document.createElement('span');t.textContent=s.from.toFixed(1)+' — '+s.to.toFixed(1)+' s';li.append(t);list.append(li);});card.append(list);}
    const actions=document.createElement('div');actions.className='proposal-actions';const confirm=document.createElement('button');confirm.className='primary';confirm.textContent='确认，开始剪';confirm.onclick=()=>{card.querySelectorAll('button').forEach(b=>b.disabled=true);confirm.textContent='✓ 已确认';begin();};actions.append(confirm);
    const alternative=document.createElement('button');alternative.textContent=selectedEdit?'先不改':loose?'恢复轻快节奏':'节奏松一点';alternative.onclick=()=>{card.remove();if(selectedEdit){message('agent','好，保留当前版本。');selectedEdit=null;setMode('ready');$('prompt').value='选一个修改，接着剪。';status('已保留第 '+String.fromCharCode(64+version)+' 版');controls();}else{loose=!loose;message('user',loose?'开头慢一点，梦醒之后多停半拍。':'还是保留原来的轻快节奏。');propose();}};actions.append(alternative);card.append(actions);$('messages').append(card);$('messages').scrollTop=$('messages').scrollHeight;controls();}
  function begin(){playing=false;elapsed=0;buildIndex=-1;operation=selectedEdit?'edit':'build';setMode(selectedEdit?'editing':'building');message('user','确认，执行这次'+(selectedEdit?'修改。':'剪辑。'));status(selectedEdit?edits[selectedEdit].label:'把素材放进时间轴…','开工啦。');$('prompt').value='正在'+(selectedEdit?edits[selectedEdit].label:'组装第一版')+'…';$('inputHint').textContent='对话、轨道与预览同步更新';bench.dataset.focus='timeline';controls();}
  function addClip(i){const s=shots()[i],clip=document.createElement('div');clip.className='clip enter';clip.dataset.shot=String(i);clip.style.left=(s.from/15*100)+'%';clip.style.width=((s.to-s.from)/15*100-.6)+'%';clip.textContent=s.name;$('videoTrack').append(clip);}
  function textClip(kind,start,end,text){const clip={kind,start,end,text};textClips.push(clip);$('textTrack').querySelector('.track-empty')?.remove();const el=document.createElement('div');el.className='clip text-clip enter';el.dataset.textKind=kind;el.style.left=start/15*100+'%';el.style.width=(end-start)/15*100+'%';el.textContent=(kind==='title'?'标题':'字幕')+' · '+text;el.title=text+' · '+start+'—'+end+' 秒';el.setAttribute('aria-label',el.title);$('textTrack').append(el);}
  function audioClip(alt=false){$('audioTrack').innerHTML='<div class="clip enter" style="left:0;width:100%"><span>'+(alt?'诙谐小节拍 · BGM B':'元气训练 · BGM A')+' / 示意音轨</span></div>';}
  function finish(){operation=null;$('flyingClip').style.opacity=0;document.querySelectorAll('.asset').forEach(a=>a.classList.remove('active'));version++;$('version').textContent='版本 '+String.fromCharCode(64+version)+' / 已确认';bench.dataset.focus='preview';
    if(selectedEdit){applied.add(selectedEdit);const kind=selectedEdit;if(kind==='title')textClip('title',0,3,'胖猫的减肥大计');if(kind==='text')textClip('caption',6,8,'再坚持一下！');if(kind==='bgm')audioClip(true);if(kind==='transition'){const m=document.createElement('i');m.className='transition-marker';m.style.left=shots()[4].from/15*100+'%';$('videoTrack').append(m);}time=kind==='transition'?shots()[4].from+.1:edits[kind].time;message('agent',kind==='bgm'?'声音轨道已换成 BGM B，镜头和文字都保留。这里用示意波形展示变化，未加载音频。':edits[kind].label+'完成。轨道和预览已同步，其他内容保留。');}
    else{audioClip();time=0;message('agent','第一版好了：五个镜头，15 秒。可以播放，也可以接着加标题、字幕、转场或换 BGM。');}
    selectedEdit=null;setMode('ready');$('prompt').value='选一个修改，接着剪。';$('inputHint').textContent='每次修改，都先给你一版提案。';status('第 '+String.fromCharCode(64+version)+' 版已就位，可以继续改。','第一版，只是开始。');$('transportNote').textContent='拖动下方进度，逐秒看改动';playing=!reduced.matches;controls();paint();}
  function fly(p,i){const area=$('canvas').getBoundingClientRect(),asset=document.querySelector('[data-asset="'+shots()[i].asset+'"]');document.querySelectorAll('.asset').forEach(a=>a.classList.toggle('active',a===asset));const a=asset.getBoundingClientRect();const raw=1-Math.pow(1-p,3);const pixel=document.documentElement.dataset.financeStyle==='pixel';const e=pixel?Math.floor(raw*16)/16:raw;const x0=a.left-area.left,y0=a.top-area.top;const target=$('videoTrack').getBoundingClientRect();const x1=target.left-area.left+target.width*shots()[i].from/15,y1=target.top-area.top;const f=$('flyingClip');f.textContent=shots()[i].name+' ↖';f.style.opacity=p<.94?'1':'0';f.style.left=(x0+(x1-x0)*e)+'px';f.style.top=(y0+(y1-y0)*e-Math.sin(p*Math.PI)*50)+'px';f.style.transform=pixel?'none':'rotate('+(-7+10*p)+'deg)';}
  function paint(){document.querySelector('.timeline-ruler').setAttribute('aria-valuenow',time.toFixed(2));const ss=shots(),index=time>=15?4:Math.max(0,ss.findIndex(s=>time>=s.from&&time<s.to));const s=ss[index]||ss[4];$('time').textContent='00:'+String(Math.floor(time)).padStart(2,'0')+' / 00:15';$('scrub').value=String(time);$('shotCaption').textContent=version||operation==='build'?s.name+' · '+time.toFixed(1)+' s':'等你按下第一剪。';$('playhead').hidden=version===0&&operation!=='build';const track=$('videoTrack');$('playhead').style.left=(track.offsetLeft+track.clientWidth*time/15)+'px';document.querySelectorAll('[data-shot]').forEach(el=>el.classList.toggle('selected',Number(el.dataset.shot)===index));
    const activeText=textClips.filter(clip=>time>=clip.start&&time<clip.end);
    const titleText=activeText.find(clip=>clip.kind==='title')?.text||'';
    const captionText=activeText.find(clip=>clip.kind==='caption')?.text||'';
    document.querySelectorAll('[data-text-kind]').forEach(el=>el.classList.toggle('selected',activeText.some(clip=>clip.kind===el.dataset.textKind)));
    const fade=applied.has('transition')?Math.max(0,1-Math.abs(time-ss[4].from)/.25):0;
    window.paintEditingPixel?.(time,titleText,captionText,fade,ss);
  }
  function reset(){if($('filmDialog').open)closeFilm();operation=null;elapsed=0;time=0;playing=false;version=0;loose=false;selectedEdit=null;applied.clear();textClips.length=0;setMode('idle');delete bench.dataset.focus;$('messages').innerHTML='<div class="welcome"><span class="eyebrow">SECOND CUT / 01</span><h1>先剪一版，<br>再说说你的<em>感觉</em>。</h1><p>一只胖猫，一场减肥大梦。<br>上秤、苦练、变瘦，最后猛地惊醒。</p><span class="welcome-mark" aria-hidden="true">✂</span></div>';$('videoTrack').innerHTML='<span class="track-empty">待确认的镜头，会在这里落下来。</span>';$('textTrack').innerHTML='<span class="track-empty">暂无文字 · 可添加标题或字幕</span>';$('audioTrack').replaceChildren();$('prompt').value='剪一段胖猫减肥短片：上秤、苦练、变瘦，最后发现是一场梦。';$('inputHint').textContent='先看提案，再决定。';$('version').textContent='草稿 / 未确认';$('transportNote').textContent='确认后，镜头才会写入时间轴';$('flyingClip').style.opacity=0;document.querySelectorAll('.asset').forEach(a=>a.classList.remove('active'));status('素材已就位','我来搭，你来定。');controls();paint();}
  $('composer').addEventListener('submit',e=>{e.preventDefault();if($('send').disabled)return;message('user',$('prompt').value);playing=false;operation='thinking';elapsed=0;setMode('thinking');status('把想法拆成剪辑提案…','想一想，再动手。');$('inputHint').textContent='正在整理剪辑提案…';controls();});
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{if(state!=='ready'||applied.has(b.dataset.edit))return;selectedEdit=b.dataset.edit;$('prompt').value=edits[selectedEdit].request;controls();});
  $('reset').onclick=reset;$('play').onclick=()=>{if(time>=15)time=0;playing=!playing;controls();};$('scrub').oninput=()=>{playing=false;time=Number($('scrub').value);controls();paint();};
  const ruler=document.querySelector('.timeline-ruler');
  ruler.tabIndex=0;ruler.setAttribute('role','slider');ruler.setAttribute('aria-label','时间刻度定位');ruler.setAttribute('aria-valuemin','0');ruler.setAttribute('aria-valuemax','15');
  const seek=value=>{if($('scrub').disabled)return;playing=false;time=Math.max(0,Math.min(15,value));controls();paint();};
  document.querySelectorAll('.timeline-ruler,.track').forEach(surface=>{
    let dragging=false;
    const seekPointer=e=>{const bounds=$('videoTrack').getBoundingClientRect();seek((e.clientX-bounds.left)/bounds.width*15);};
    surface.addEventListener('pointerdown',e=>{if(e.button!==0||$('scrub').disabled)return;e.preventDefault();dragging=true;surface.setPointerCapture(e.pointerId);seekPointer(e);});
    surface.addEventListener('pointermove',e=>{if(dragging)seekPointer(e);});
    const stop=()=>{dragging=false;};surface.addEventListener('pointerup',stop);surface.addEventListener('pointercancel',stop);surface.addEventListener('lostpointercapture',stop);
  });
  ruler.addEventListener('keydown',e=>{const values={ArrowLeft:time-.1,ArrowRight:time+.1,Home:0,End:15};if(e.key in values){e.preventDefault();seek(values[e.key]);}});
  const originalPreview=$('phone').parentElement;let previousPlaying=false;
  function closeFilm(){originalPreview.insertBefore($('phone'),$('shotCaption'));$('filmDialog').close();playing=previousPlaying;controls();paint();}
  $('export').onclick=()=>{previousPlaying=playing;time=0;$('filmHost').append($('phone'));$('filmHeading').textContent='你的第 '+String.fromCharCode(64+version)+' 版 · 15 秒';$('filmDialog').showModal();playing=!reduced.matches;controls();};$('closeFilm').onclick=closeFilm;$('filmDialog').addEventListener('cancel',e=>{e.preventDefault();closeFilm();});
  document.addEventListener('visibilitychange',()=>{last=0;});
  function tick(now){const dt=last?Math.min((now-last)/1000,.08):0;last=now;if(!document.hidden){
    if(operation){elapsed+=dt;
      if(operation==='thinking'&&elapsed>=1.4){message('agent',selectedEdit?edits[selectedEdit].reply:'先用圆肚皮交代主角，上秤后加快训练节奏；瘦下来时停一拍，再切回床上揭晓梦境。');propose();}
      else if(operation==='build'){const i=Math.min(4,Math.floor(elapsed/1.05));const p=(elapsed/1.05)%1;if(i!==buildIndex){buildIndex=i;if(i===0)$('videoTrack').replaceChildren();status('正在放入镜头 '+(i+1)+' / 5 · '+shots()[i].name);time=shots()[i].from;}if(!reduced.matches)fly(p,i);if(p>.65&&!document.querySelector('[data-shot="'+i+'"]'))addClip(i);if(elapsed>=5.35){for(let n=0;n<5;n++)if(!document.querySelector('[data-shot="'+n+'"]'))addClip(n);finish();}}
      else if(operation==='edit'){time=edits[selectedEdit].time;bench.dataset.focus='preview';if(elapsed>=1.8)finish();}
    }else if(playing){time+=dt;if(time>=15){time=15;playing=false;controls();}}
    paint();
  }requestAnimationFrame(tick);}
  if(parent!==window)new ResizeObserver(()=>parent.postMessage({type:'editing-sketch-height',height:Math.ceil(bench.getBoundingClientRect().height)+8},location.origin)).observe(bench);
  reset();requestAnimationFrame(tick);
})();
