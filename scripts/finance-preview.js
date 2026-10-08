// Authored scenarios follow the repository's runtime branches, not live API telemetry.
(() => {
  const root=document.getElementById('financePreview');
  if(!root||!window.FinanceModules||!window.FinanceDemoCases||!window.FinanceDemoResults)return;
  const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
  const messages=$('financeMessages'), svg=$('financeTraceEdges'), nodes=$('financeTraceNodes');
  const inspector=$('financeTraceInspector'), send=$('financeSend'), pause=$('financePause'), frame=$('chapterFinance');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const compactView=matchMedia('(max-width:760px)');
  const modules=new Map(window.FinanceModules.map(n=>[n.id,n]));
  const cases=window.FinanceDemoCases, example=()=>cases[scenario];
  const extra=[
    {id:'direct',title:'直接回复',role:'不需要读取数据',source:'graph/runtime.py · render_direct_response',copy:'动作校验返回 direct_response 后，使用响应规划中的 message 回复；帮助、普通对话和不允许的动作不会进入查询执行器。'},
    {id:'prior',title:'引用已有结果',role:'dependent_flow',source:'graph/runtime.py · load_prior_result / generate_dependent_method',copy:'动作提案包含 result_refs 时，载入已有结果并生成依赖方法，然后进入方法校验。执行还需要对应的结果使用授权。此分支仅展示结构。'},
    {id:'repair',title:'修复方法',role:'携带错误重新生成',source:'graph/runtime.py · repair_method / _can_repair',copy:'方法校验或模拟试运行失败时，携带错误信息修复方法，随后重新校验。达到修复次数上限则拒绝；这里的修复案例和时序为演示编排。'},
    {id:'refuse',title:'拒绝并说明',role:'修复额度耗尽',source:'graph/runtime.py · after_method_review / after_synthetic_check / refuse_method',copy:'校验失败且不再允许修复时，返回拒绝说明并记录审计，不进入执行。此分支仅展示结构。'}
  ];
  extra.forEach(n=>modules.set(n.id,{seq:'分支',...n}));
  const aliases={response:'router',validation:'router',sandbox:'execution',source:'execution','result-store':'evidence',audit:'evidence'};
  const key=id=>aliases[id]||id;
  const tiles=[
    {id:'llm',model:'llm',x:14,y:24,label:'MODEL'},
    {id:'memory',model:'memory',x:210,y:24,label:'CONTEXT'},
    {id:'policy',model:'policy',x:406,y:24,label:'POLICY'},
    {id:'api',model:'api',x:14,y:132,label:'ENTRY'},
    {id:'router',model:'response',x:210,y:132,label:'RUNTIME',title:'意图与路由'},
    {id:'prior',model:'prior',x:406,y:132,label:'RESULT REFS'},
    {id:'direct',model:'direct',x:14,y:242,label:'RESPONSE'},
    {id:'repair',model:'repair',x:210,y:242,label:'REPAIR',kind:'core'},
    {id:'analysis',model:'analysis',x:406,y:242,label:'PLAN / METHOD'},
    {id:'approval',model:'approval',x:14,y:352,label:'HUMAN'},
    {id:'review-node',model:'review-node',x:210,y:352,label:'REVIEW / DRY RUN'},
    {id:'refuse',model:'refuse',x:406,y:352,label:'STOP'},
    {id:'reply',model:'reply',x:14,y:462,label:'RESPONSE'},
    {id:'execution',model:'sandbox',x:210,y:462,label:'TOOL / RUNNER',title:'执行查询'},
    {id:'evidence',model:'result-store',x:406,y:462,label:'RESULT / AUDIT',title:'结果与审计'}
  ];
  const tileById=new Map(tiles.map(n=>[n.id,n])), nodeEls=new Map(), edgeEls=new Map();
  let scenario='query', stages=[], index=-1, progress=0, elapsed=0, state='idle', inspected=null, visible=true, last=performance.now();
  let approvalRemaining=0, approvalAction=null, approvalButton=null;
  let completedMethods=0;
  const step=(id,duration,status,more={})=>({id,duration,status,...more});
  const startSteps=()=>[
    step('api',1000,'建立本次请求与会话'),
    step('response',1600,'理解意图，提出响应或工具调用方案'),
    step('validation',1700,scenario==='direct'?'动作校验：选择 direct_response':'动作校验：选择 method_flow')
  ];
  function buildScenario(){
    const start=startSteps();
    if(scenario==='direct')return [...start,step('direct',1800,'无需读取数据，直接回答'),step('audit',1000,'记录本次响应')];
    const planning=[step('analysis',2400,scenario==='health'?'识别三个分析维度，准备串行方法计划':'按需检索 Schema，规划并生成方法')];
    if(scenario==='repair')planning.push(
      step('review-node',1800,'发现字段不匹配，返回修复分支',{failed:true}),
      step('repair',2400,'携带字段错误，重新生成方法',{edge:'review-repair'}),
      step('review-node',2000,'重新校验并试运行：通过',{edge:'repair-review'})
    );
    else planning.push(step('review-node',2100,'方法校验与模拟试运行：通过'));
    const execution=scenario==='health'?example().methods.map((m,i)=>step('source',2800,`执行方法 ${i+1} / 3：${m.name}`,{method:i})): [step('source',2000,`执行：${example().method}`)];
    return [...start,...planning,step('approval',0,'方案已准备好，等待你确认',{wait:true}),
      step('sandbox',1200,'授权已收到，交给本地执行器'),...execution,
      step('result-store',1000,'保存结果与授权引用'),step('reply',2000,'基于私有结果生成解读'),step('audit',900,'记录本次运行与分支')];
  }
  function blockMarkup(node,label){return `<svg class="finance-block" viewBox="0 0 182 74" preserveAspectRatio="none" aria-hidden="true"><path class="block-shadow" d="M 5 17 H 177 V 72 H 5 Z"/><path class="block-side" d="M 171 10 L 180 1 V 61 L 171 70 Z"/><path class="block-top" d="M 1 10 L 10 1 H 180 L 171 10 Z"/><path class="block-hatch" d="M 8 9 L 15 2 M 17 9 L 24 2 M 26 9 L 33 2 M 35 9 L 42 2 M 44 9 L 51 2 M 53 9 L 60 2 M 62 9 L 69 2 M 71 9 L 78 2 M 80 9 L 87 2 M 89 9 L 96 2 M 98 9 L 105 2 M 107 9 L 114 2 M 116 9 L 123 2 M 125 9 L 132 2 M 134 9 L 141 2 M 143 9 L 150 2 M 152 9 L 159 2 M 161 9 L 168 2"/><path class="block-front" d="M 1 10 H 171 V 70 H 1 Z"/></svg><small>${node.seq}</small><strong>${node.title}</strong>`;}

  function svgEl(tag,attrs){const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;}
  svg.setAttribute('viewBox','0 0 600 565');
  svg.innerHTML='<defs><marker id="financeArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 Z" fill="#a36d59"/></marker></defs>';
  svg.append(svgEl('path',{d:'M 7 12 H 586 L 596 22 V 102 H 7 Z',class:'finance-support-boundary'}));
  const links=[
    ['api-router','api','router','M 186 163 H 210'],
    ['router-direct','router','direct','M 210 174 H 198 V 220 H 100 V 242','直接回答',100,216],
    ['router-plan','router','analysis','M 296 194 V 216 H 492 V 242','新查询',384,211],
    ['router-prior','router','prior','M 382 163 H 406'],
    ['prior-review','prior','review-node','M 578 163 H 592 V 338 H 320 V 352','依赖方法',545,334],
    ['plan-review','analysis','review-node','M 492 304 V 332 H 296 V 352','方法',419,327],
    ['review-repair','review-node','repair','M 270 352 V 304','失败',257,333,'repair'],
    ['repair-review','repair','review-node','M 382 273 H 394 V 383 H 382','再检查',394,319,'repair'],
    ['review-approval','review-node','approval','M 210 383 H 186'],
    ['review-refuse','review-node','refuse','M 382 383 H 406'],
    ['approval-execution','approval','execution','M 100 414 V 441 H 296 V 462','用户确认后',190,436],
    ['execution-evidence','execution','evidence','M 382 493 H 406'],
    ['evidence-reply','evidence','reply','M 492 524 V 548 H 100 V 524','结果返回',295,544],
    ['reply-audit','reply','evidence','M 100 524 V 548 H 492 V 524','',0,0,'audit'],
    ['direct-audit','direct','evidence','M 14 273 H 5 V 558 H 586 V 507 H 578','',0,0,'audit']
  ];
  links.forEach(([id,from,to,d,label,x,y,kind])=>{
    const base=svgEl('path',{d,class:`finance-edge ${kind||''}`,'marker-end':'url(#financeArrow)'}),flow=svgEl('path',{d,class:`finance-edge-flow ${kind||''}`,pathLength:'1'});
    svg.append(base,flow);let text;
    if(label){text=svgEl('text',{x,y,class:'finance-route-label','text-anchor':'middle'});text.textContent=label;svg.append(text);}
    edgeEls.set(id,{id,from,to,base,flow,text});
  });
  const supports=[
    {id:'llm',d:'M 100 86 V 114 H 274 V 132',targets:['response','analysis','repair','reply']},
    {id:'memory',d:'M 296 86 V 132',targets:['response']},
    {id:'policy',d:'M 492 86 V 108 H 322 V 132',targets:['validation','analysis','review-node']}
  ];
  supports.forEach(s=>{s.path=svgEl('path',{d:s.d,class:`finance-support-edge ${s.id}`});svg.append(s.path);});
  tiles.forEach(tile=>{
    const model=modules.get(tile.model),button=document.createElement('button');button.type='button';button.className=`finance-trace-node ${tile.kind||model.kind||''}`;button.dataset.node=tile.id;
    button.style.left=`${tile.x/6}%`;button.style.top=`${tile.y/5.65}%`;button.innerHTML=blockMarkup({...model,title:tile.title||model.title,seq:tile.label},'');
    button.setAttribute('aria-label',`查看${tile.title||model.title}的对应实现`);button.addEventListener('click',()=>{inspected=tile.model;showInspector(tile.model);paintNodes();});nodes.append(button);nodeEls.set(tile.id,button);
  });
  const routeDot=svgEl('circle',{r:4,class:'finance-route-dot'});svg.append(routeDot);
  const scene=root.querySelector('.finance-replay-layout'),bridge=svgEl('svg',{class:'finance-conversation-bridge','aria-hidden':'true'}),bridgePath=svgEl('path',{}),bridgeDot=svgEl('circle',{r:3.5});bridge.append(bridgePath,bridgeDot);scene.append(bridge);
  let bridgeMessage=null,bridgeNode=null,bridgeReverse=false,bridgeMotion=0;
  const picker=document.createElement('label');picker.className='finance-example-picker';const pickerLabel=document.createElement('span');pickerLabel.textContent='示例';
  const chooser=document.createElement('select');chooser.setAttribute('aria-label','示例问题');
  Object.entries(cases).forEach(([id,c])=>{const option=document.createElement('option');option.value=id;option.textContent=c.label;chooser.append(option);});
  chooser.addEventListener('change',()=>{scenario=chooser.value;reset();});picker.append(pickerLabel,chooser);root.querySelector('.finance-composer>div').prepend(picker);
  const traceTitle=root.querySelector('.finance-trace-head>span');traceTitle.textContent='Runtime · 分支与调用';
  const legend=document.createElement('div');legend.className='finance-runtime-legend';legend.innerHTML='<span>实线：运行分支</span><span>虚线：上下文与策略</span>';root.querySelector('.finance-trace-canvas').after(legend);
  // Move the existing live graph into the mobile dialog, rather than replaying a second copy.
  const trace=root.querySelector('.finance-trace'),graphDialog=$('financeGraphDialog'),liveStep=$('financeLiveStep');
  const traceHome=document.createComment('finance graph home');trace.before(traceHome);
  const graphScroll=document.createElement('div');graphScroll.className='finance-graph-scroll';
  const traceCanvas=$('financeTraceCanvas');traceCanvas.before(graphScroll);graphScroll.append(traceCanvas);
  const systemWindow=document.createElement('div');systemWindow.className='finance-system-window';
  const windowHead=trace.querySelector('.finance-trace-head');windowHead.before(systemWindow);
  systemWindow.append(windowHead,graphScroll,legend);
  let graphReturnFocus=null;
  function openGraph(){
    if(!compactView.matches||graphDialog.open)return;
    graphReturnFocus=document.activeElement;$('financeGraphHost').append(trace);graphDialog.showModal();
    requestAnimationFrame(()=>{const tile=nodeEls.get(key(inspected||current()?.id));if(tile)graphScroll.scrollLeft=Math.max(0,tile.offsetLeft-graphScroll.clientWidth/2+tile.offsetWidth/2);});
  }
  function restoreGraph(){traceHome.after(trace);drawBridge();if(graphReturnFocus?.isConnected)graphReturnFocus.focus({preventScroll:true});graphReturnFocus=null;}
  liveStep.addEventListener('click',openGraph);
  $('financeGraphClose').addEventListener('click',()=>graphDialog.close());
  graphDialog.addEventListener('close',restoreGraph);
  graphDialog.addEventListener('click',e=>{if(e.target===graphDialog){const r=graphDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)graphDialog.close();}});
  compactView.addEventListener('change',()=>{if(!compactView.matches&&graphDialog.open)graphDialog.close();drawBridge();});
  function updateLiveStep(){
    const s=current(),titles={idle:'选择问题，开始一次查询',running:'正在运行',waiting:'等待确认',paused:'已暂停',done:'本次运行已完成',cancelled:'已取消执行'};
    $('financeLiveLabel').textContent=titles[state];
    $('financeLiveTitle').textContent=state==='idle'?'查看系统的分支与调用':state==='done'?'回答已返回对话':state==='cancelled'?'查询没有执行':Number.isInteger(s?.method)?`方法 ${s.method+1} / 3 · ${example().methods[s.method].name}`:tileById.get(key(s?.id))?.title||modules.get(s?.id)?.title||'运行链路';
    $('financeLiveCopy').textContent=state==='done'?'展开链路，回看本次经过的节点。':state==='cancelled'?'确认之前停止，保留取消记录。':state==='idle'?'发送问题后，这里显示当前步骤。':s?.status||'';
  }
  function current(){return stages[index];}
  function transitionAt(i){
    if(i<1)return null;if(stages[i].edge)return edgeEls.get(stages[i].edge);
    const from=key(stages[i-1].id),to=key(stages[i].id);if(from===to)return null;
    return [...edgeEls.values()].find(e=>e.from===from&&e.to===to)||null;
  }
  function syncFullMap(){const completed=stages.slice(0,state==='done'?stages.length:Math.max(index,0)).map(s=>s.id).filter(id=>window.FinanceModules.some(n=>n.id===id));const id=current()?.id;frame?.contentWindow?.postMessage({type:'finance-replay-state',node:window.FinanceModules.some(n=>n.id===id)?id:null,state,completed},location.origin);}
  frame?.addEventListener('load',syncFullMap);
  function showInspector(id){
    const node=modules.get(id);if(!node)return;inspector.replaceChildren();
    if(scenario==='health'&&!inspected&&stages.slice(0,index+1).some(s=>s.id==='analysis')){renderMethodQueue();return;}
    const heading=document.createElement('h3');heading.className='finance-note-heading';
    const label=document.createElement('span');label.textContent=inspected?'节点职责 · ':'当前状态 · ';
    heading.append(label,document.createTextNode(tileById.get(key(id))?.title||node.title));
    const copy=document.createElement('p');copy.textContent=inspected?node.role:state==='cancelled'?'已取消，没有进入执行器。':state==='done'?'本次响应已完成。':current()?.status;
    const details=document.createElement('div');details.className='finance-node-source';const source=document.createElement('code');source.textContent=node.source;
    const explanation=document.createElement('p');explanation.textContent=key(id)==='router'?'合并展示 plan_response 与 validate_action：先提出响应方案，再校验动作；根据路由选择直接回复、新查询或依赖已有结果。':node.copy;details.append(explanation,source);
    if(key(id)==='evidence'){source.textContent='memory/private_result_store.py · audit/audit_logger.py';explanation.textContent='合并呈现两类职责：查询结果保存在私有结果存储；审计记录响应、授权、执行与错误状态。直接回复只记录审计，不产生查询结果。';}
    if(scenario==='health'&&key(id)==='execution'){explanation.textContent='此场景的三个方法串行执行为前端 mock。当前后端已有多方法规划、校验和授权卡，确认执行入口仍调用 methods[0]，尚未执行完整方法列表。';}
    if(key(id)==='router'){const ref=document.createElement('code');ref.textContent='graph/runtime.py · after_action_validation';details.append(ref);}
    if(id==='api'||id==='approval'){const api=document.createElement('code');api.textContent=id==='api'?'GET /v1/runs/stream':'POST /v1/runs/{request_id}/method-review/approve';details.append(api);}
    inspector.append(heading);if(!inspected)inspector.append(copy);inspector.append(details);
  }
  function renderMethodQueue(){
    const label=document.createElement('span');label.className='finance-small-label';label.textContent=`方法队列 · 串行 · ${completedMethods} / 3 已完成`;
    const queue=document.createElement('ol');queue.className='finance-method-queue';
    example().methods.forEach((m,i)=>{const item=document.createElement('li');item.dataset.method=String(i);const running=current()?.method===i&&state==='running';item.dataset.status=i<completedMethods?'done':running?'running':'pending';
      const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');const title=document.createElement('strong');title.textContent=m.name;const status=document.createElement('small');status.textContent=i<completedMethods?'已完成':running?'运行中':current()?.method===i&&state==='paused'?'已暂停':'等待';item.append(number,title,status);queue.append(item);});
    const note=document.createElement('p');note.className='finance-method-status';note.textContent=state==='done'?'已汇总三个方法，生成报告。':current()?.status;inspector.append(label,queue,note);
  }
  function paintNodes(){
    const visited=new Set(stages.slice(0,state==='done'?stages.length:Math.max(index,0)).map(s=>key(s.id))),active=current()&&key(current().id);
    tiles.forEach(t=>{const el=nodeEls.get(t.id),isCurrent=t.id===active&&state!=='done';el.classList.toggle('is-current',isCurrent);el.classList.toggle('is-done',visited.has(t.id)&&!isCurrent);el.classList.toggle('is-inspected',t.id===key(inspected));el.classList.toggle('is-failed',isCurrent&&!!current()?.failed);if(isCurrent)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    supports.forEach(s=>{const active=index>=0&&!['done','cancelled'].includes(state)&&s.targets.includes(current().id);nodeEls.get(s.id).classList.toggle('is-supporting',active);s.path.classList.toggle('is-supporting',active);});
    const taken=new Set(stages.slice(0,state==='done'?stages.length:Math.max(index,0)).map((_,i)=>transitionAt(i)?.id).filter(Boolean));
    const moving=transitionAt(index),amount=['waiting','cancelled','done'].includes(state)||reducedMotion.matches?1:Math.min(1,progress/1100);
    edgeEls.forEach(e=>{const now=e===moving&&state!=='done';e.flow.style.strokeDashoffset=String(1-(now?amount:taken.has(e.id)?1:0));e.base.classList.toggle('is-taken',taken.has(e.id)||now);e.text?.classList.toggle('is-taken',taken.has(e.id)||now);e.flow.classList.toggle('is-current',now&&state==='running');});
    routeDot.style.display=moving&&amount<1&&['running','paused'].includes(state)&&!reducedMotion.matches?'block':'none';if(moving&&amount<1){const point=moving.flow.getPointAtLength(moving.flow.getTotalLength()*amount);routeDot.setAttribute('cx',point.x);routeDot.setAttribute('cy',point.y);}
    root.dataset.state=state;
    const method=current()?.method,activeMethod=Number.isInteger(method)&&scenario==='health'&&state!=='done';
    nodeEls.get('execution').querySelector('small').textContent=activeMethod?`METHOD ${method+1} / 3`:'TOOL / RUNNER';
    nodeEls.get('execution').querySelector('strong').textContent=activeMethod?example().methods[method].name:'执行查询';
    const task=inspector.querySelector('[data-status="running"]');if(task)task.style.setProperty('--method-progress',`${Math.min(100,progress/(current()?.duration||1)*100)}%`);
  }
  function scrollChat(){messages.scrollTo({top:messages.scrollHeight,behavior:'instant'});requestAnimationFrame(()=>{messages.scrollTo({top:messages.scrollHeight,behavior:'instant'});drawBridge();});}
  function drawBridge(){
    if(!bridgeMessage||!bridgeNode||compactView.matches){bridge.style.display='none';return;}
    const bounds=scene.getBoundingClientRect(),chatBounds=messages.getBoundingClientRect(),msg=bridgeMessage.getBoundingClientRect(),node=nodeEls.get(key(bridgeNode)).getBoundingClientRect();
    if(msg.bottom<chatBounds.top||msg.top>chatBounds.bottom){bridge.style.display='none';return;}
    const y=Math.min(chatBounds.bottom-12,Math.max(chatBounds.top+12,(msg.top+msg.bottom)/2))-bounds.top,fromX=msg.right-bounds.left+3,toX=node.left-bounds.left-2,toY=(node.top+node.bottom)/2-bounds.top,seam=root.querySelector('.finance-chat').getBoundingClientRect().right-bounds.left;
    bridge.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    if(tileById.get(key(bridgeNode)).x>100){const laneY=node.top-bounds.top-17,portX=(node.left+node.right)/2-bounds.left;bridgePath.setAttribute('d',`M ${fromX} ${y} H ${seam} V ${laneY} H ${portX} V ${node.top-bounds.top-1}`);}
    else bridgePath.setAttribute('d',`M ${fromX} ${y} H ${seam-9} Q ${seam} ${y} ${seam} ${y+(toY>y?9:-9)} V ${toY+(toY>y?-9:9)} Q ${seam} ${toY} ${seam+9} ${toY} H ${toX}`);
    bridge.style.display='block';const f=Math.min(1,bridgeMotion/850),point=bridgePath.getPointAtLength(bridgePath.getTotalLength()*(bridgeReverse?1-f:f));bridgeDot.setAttribute('cx',point.x);bridgeDot.setAttribute('cy',point.y);
  }
  function connectMessage(item,node,reverse=true){bridgeMessage=item;bridgeNode=node;bridgeReverse=reverse;bridgeMotion=0;drawBridge();}
  messages.addEventListener('scroll',drawBridge,{passive:true});new ResizeObserver(drawBridge).observe(scene);
  function textMessage(text,role='assistant',node=null){
    const item=document.createElement('article');item.className=`finance-message ${role}`;
    if(node){const tag=document.createElement('button');tag.type='button';tag.className='finance-message-node';tag.textContent=(key(node)==='router'?'意图与路由':modules.get(node).title)+' ↗';tag.addEventListener('click',()=>{inspected=node;showInspector(node);paintNodes();openGraph();});item.append(tag);}
    const p=document.createElement('p');p.textContent=text;item.append(p);messages.append(item);scrollChat();if(node)connectMessage(item,node);return item;
  }
  function statusText(text){$('financeProgress').textContent=text;}
  function prompt(){return example().question;}
  function controls(){
    pause.disabled=['waiting','done','cancelled'].includes(state);pause.textContent=state==='idle'?'▷ 播放':state==='paused'?'▷ 继续':'Ⅱ 暂停';send.disabled=state!=='idle';
    chooser.value=scenario;chooser.disabled=!['idle','done','cancelled'].includes(state);
    $('financeTraceStatus').textContent=state==='idle'?'等待路由':state==='waiting'?'等待确认':state==='paused'?'播放暂停':state==='done'?'本次路径已完成':state==='cancelled'?'已取消':current()?.failed?'校验失败 → 修复':current()?.id==='validation'?(scenario==='direct'?'direct_response':'method_flow'):current()?.id==='repair'?'repair → review':modules.get(current()?.id)?.title;
    $('financeComposerHint').textContent=state==='idle'?'预设问题 · 模拟场景':state==='waiting'?'可立即确认，或取消本次演示':state==='done'||state==='cancelled'?'可重播或切换场景':'按当前分支继续';
    $('financePrompt').textContent=state==='idle'?prompt():state==='waiting'?'演示将在 3 秒后自动确认。':state==='done'?'回复已返回对话。':state==='cancelled'?'本次查询没有执行。':'正在处理这条问题…';
    if(index>=0)showInspector(inspected||current().id);paintNodes();syncFullMap();updateLiveStep();
  }
  function approvalCard(){
    const item=document.createElement('article');item.className='finance-message assistant finance-approval';item.innerHTML='<span class="finance-message-node">用户确认</span><h4>查询方案已准备好。</h4><p>汇总 2026 年 1—3 月收入，只读取月份和收入金额。</p><details class="finance-query"><summary>查看示例 SQL</summary><pre><code>SELECT month, SUM(revenue) AS revenue\nFROM demo_revenue\nWHERE month BETWEEN \'2026-01\' AND \'2026-03\'\nGROUP BY month ORDER BY month;</code></pre></details><div class="finance-approval-actions"><button class="finance-confirm" type="button">确认执行 →</button><button class="finance-cancel" type="button">取消</button></div>';
    item.querySelector('p').textContent=example().scope;
    item.querySelector('summary').textContent=scenario==='health'?'查看三个方法':'查看示例 SQL';
    item.querySelector('code').textContent=scenario==='health'?example().methods.map((m,i)=>`${i+1}. ${m.name}\n${m.operation}\n${m.sql}`).join('\n\n'):example().sql||cases.query.sql;
    const body=document.createElement('div'),bodyInner=document.createElement('div'),receipt=document.createElement('button');
    body.className='finance-approval-body';body.id='financeApprovalBody';bodyInner.className='finance-approval-content';
    while(item.children.length>1)bodyInner.append(item.children[1]);
    body.append(bodyInner);item.append(body);receipt.type='button';receipt.className='finance-receipt-toggle';receipt.hidden=true;receipt.setAttribute('aria-controls',body.id);item.insertBefore(receipt,body);
    receipt.addEventListener('click',()=>{const open=receipt.getAttribute('aria-expanded')!=='true';receipt.setAttribute('aria-expanded',String(open));item.classList.toggle('is-folded',!open);bodyInner.inert=!open;});
    const settle=label=>{item.classList.add('is-settled','is-folded');receipt.hidden=false;receipt.disabled=false;receipt.textContent=label+' · 查看方案';receipt.setAttribute('aria-expanded','false');bodyInner.inert=true;};
    approvalRemaining=3000;approvalButton=item.querySelector('.finance-confirm');approvalButton.textContent='确认执行 · 3s';approvalButton.setAttribute('aria-label','确认执行');
    approvalAction=(automatic=false)=>{if(state!=='waiting')return;approvalAction=null;approvalRemaining=0;approvalButton.textContent=automatic?'已自动确认':'已确认';item.querySelectorAll('button').forEach(b=>b.disabled=true);settle(automatic?'✓ 演示已自动确认':'✓ 已确认');const msg=textMessage(automatic?'演示自动确认，继续执行。':'确认，执行这次查询。',automatic?'assistant':'user');state='running';last=performance.now();enter(index+1);connectMessage(msg,'approval',false);if(!automatic)pause.focus({preventScroll:true});};
    approvalButton.addEventListener('click',()=>approvalAction?.(false));
    item.querySelector('.finance-cancel').addEventListener('click',()=>{if(state!=='waiting')return;approvalAction=null;approvalRemaining=0;approvalButton.textContent='已取消';item.querySelectorAll('button').forEach(b=>b.disabled=true);settle('已取消 · 未执行');state='cancelled';textMessage('取消这次查询。','user');textMessage('已取消，没有执行查询。','assistant','approval');statusText('已取消 · 未进入执行器');controls();$('financeReset').focus({preventScroll:true});});
    messages.append(item);scrollChat();connectMessage(item,'approval');
  }
  function resultCard(){
    const item=document.createElement('article');item.className='finance-message assistant finance-result-message';item.append(window.FinanceDemoResults.render(example()));messages.append(item);connectMessage(item,'reply');
    requestAnimationFrame(()=>{messages.scrollTo({top:messages.scrollTop+item.getBoundingClientRect().top-messages.getBoundingClientRect().top-12,behavior:'instant'});drawBridge();});
  }
  function enter(next){
    index=next;progress=0;inspected=null;bridgeMessage=null;bridge.style.display='none';const s=current();
    if(s.id==='api')connectMessage(messages.lastElementChild,'api',false);
    if(s.wait){state='waiting';approvalCard();}
    else if(s.id==='validation')textMessage(scenario==='direct'?'这是一个能力介绍问题，不需要查询数据。':scenario==='health'?'这是一个综合分析问题，需要从收入、盈利和现金流三个方面判断。':'这需要读取相关数据。我会先准备查询方案，执行前交给你确认。','assistant','validation');
    else if(s.id==='analysis'&&scenario==='health'){const plan=textMessage('我会依次运行三个方法，再汇总成报告。','assistant','analysis'),list=document.createElement('ol');list.className='finance-chat-plan';example().methods.forEach(m=>{const li=document.createElement('li');li.textContent=m.name+' · '+m.operation;list.append(li);});plan.append(list);}
    else if(s.failed)textMessage('方法中的字段没有通过校验。我会带着错误修复，再检查一次。','assistant','review-node');
    else if(s.id==='review-node'&&scenario==='repair')textMessage('已修正字段，重新校验与模拟试运行通过。','assistant','review-node');
    else if(s.id==='sandbox')textMessage(scenario==='health'?'已确认三个方法，开始按顺序运行。':'收到确认，现在执行查询。','assistant','sandbox');
    else if(Number.isInteger(s.method))textMessage(`开始方法 ${s.method+1} / 3：${example().methods[s.method].name}。`,'assistant','source');
    else if(s.id==='direct')textMessage('我可以协助汇总收支、比较期间变化，并解释查询结果。需要读取数据时，我会先展示查询方案，等你确认后执行。','assistant','direct');
    statusText(s.status);controls();scrollChat();
  }
  function reset(){
    index=-1;progress=0;elapsed=0;completedMethods=0;state='idle';inspected=null;approvalAction=null;approvalRemaining=0;approvalButton=null;stages=buildScenario();last=performance.now();bridgeMessage=null;bridge.style.display='none';
    root.dataset.example=scenario;root.querySelector('.finance-preview-bar small').textContent=scenario==='health'?'多方法 mock · 示例数据':'交互演示 · 示例数据';
    messages.innerHTML='<div class="finance-chat-empty"><span>一个问题，一次有依据的回答。</span><p>发送下方问题，跟随亮起的节点，<br>看系统如何查找、检查，再返回结果。</p><div class="finance-starter-options" aria-label="推荐示例"></div></div>';
    [['query','查收入'],['cash','看现金流'],['health','综合分析']].forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(scenario===id));button.addEventListener('click',()=>{scenario=id;reset();messages.querySelectorAll('.finance-starter-options button')[['query','cash','health'].indexOf(id)]?.focus({preventScroll:true});});messages.querySelector('.finance-starter-options').append(button);});
    inspector.innerHTML='<h3 class="finance-note-heading">先判断，再选择路径。</h3><p>未选中的分支保持原色；点击节点查看职责与对应实现。</p>';
    $('financeElapsed').textContent='00';statusText(scenario==='repair'?'示例包含一次字段错误与修复':'等待发送示例问题');controls();
  }
  send.addEventListener('click',()=>{if(state!=='idle')return;messages.replaceChildren();textMessage(prompt(),'user');state='running';last=performance.now();enter(0);pause.focus({preventScroll:true});});
  pause.addEventListener('click',()=>{if(state==='idle'){send.click();return;}if(state==='running')state='paused';else if(state==='paused')state='running';last=performance.now();statusText(state==='paused'?'播放暂停':current().status);controls();});
  $('financeReset').addEventListener('click',()=>{reset();send.focus({preventScroll:true});});
  document.querySelectorAll('[data-finance-case]').forEach(button=>button.addEventListener('click',()=>{
    const next=button.dataset.financeCase;if(!Object.hasOwn(cases,next))return;
    scenario=next;reset();root.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});send.click();
  }));
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=performance.now();},{threshold:.08}).observe(root);
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
  function tick(now){
    const delta=Math.min(100,Math.max(0,now-last));last=now;
    if(bridgeMessage&&bridgeMotion<850&&visible&&!document.hidden&&state!=='paused'){bridgeMotion+=delta;drawBridge();}
    if(state==='waiting'&&visible&&!document.hidden&&approvalAction){approvalRemaining=Math.max(0,approvalRemaining-delta);approvalButton.style.setProperty('--confirm-progress',String(1-approvalRemaining/3000));const seconds=Math.ceil(approvalRemaining/1000);approvalButton.textContent=`确认执行 · ${seconds}s`;$('financePrompt').textContent=`演示将在 ${seconds} 秒后自动确认。`;if(approvalRemaining===0)approvalAction(true);}
    else if(state==='running'&&visible&&!document.hidden){progress+=delta;elapsed+=delta;$('financeElapsed').textContent=String(Math.floor(elapsed/1000)).padStart(2,'0');paintNodes();
      if(progress>=current().duration){if(Number.isInteger(current().method)){completedMethods=current().method+1;textMessage(`方法 ${completedMethods} / 3 已完成。${example().methods[current().method].finding}`,'assistant','source');}
        if(index===stages.length-1){state='done';if(scenario!=='direct')resultCard();else connectMessage(messages.lastElementChild,'direct');statusText('已完成 · 仅高亮本次走过的路径');controls();}else enter(index+1);}}
    requestAnimationFrame(tick);
  }
  reset();requestAnimationFrame(tick);
})();
