(() => {
  'use strict';
  const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data,step=0,choice=null,selected=null,timer;
  const root=$('governance');
  root.innerHTML=`<div class="gov-layout"><section class="gov-chat" aria-label="冲突处理对话"><header class="gov-head"><h2>变化发生之后。</h2><small>项目 A · 交互演示</small></header><div class="gov-messages" id="gov-messages" tabindex="0" aria-label="对话与主动汇报"></div><div class="gov-composer"><textarea id="gov-input" readonly aria-label="下一条演示消息"></textarea><div class="gov-composer-row"><small id="gov-hint">预设场景</small><div class="gov-model"><span>Mock-6 Ultra <small>演示</small></span><button class="gov-send" id="gov-send" aria-label="发送演示消息" disabled>↑</button></div></div></div></section><section class="gov-map" aria-label="冲突关系图"><div class="gov-map-header"><h2>记忆关系</h2><span class="gov-stats">待确认 <b id="gov-pending">0</b></span></div><div class="gov-status" id="gov-status" role="status"></div><div class="gov-canvas"><svg id="gov-graph" viewBox="0 0 580 485" role="group" aria-label="预算与负责人记忆的状态变化"></svg></div><div class="gov-legend"><span>当前采纳</span><span>待确认</span><span>历史版本</span></div><div class="gov-inspector" id="gov-inspector"></div></section></div><footer class="gov-footer"><div><span class="gov-step">01 记住</span>　→　<span class="gov-step">02 检测冲突</span>　→　<span class="gov-step">03 处理并汇报</span></div><button id="gov-restart">重新体验 ↺</button></footer><details class="gov-proof"><summary>演示数据与实现依据</summary><p>输入为虚构场景。节点状态、冲突关系、规则裁决与两条人工分支，来自运行本地 Edgelore 构建的真实输出；本页回放这些快照。自然语言汇报、触发时序和按钮交互由前端编排，不代表已有线上主动推送服务，也不是 LongMemEval 测评记录。此处预算规则为单维约束。</p><p>规则仅在存在已启用、经人工批准且能唯一裁决的约束时自动处理。负责人场景没有这样的规则，保留待确认；用户选择后保留旧记录与裁决来源。</p><a href="./conflict-case.json" target="_blank" rel="noopener">查看核心输出 JSON ↗</a><a href="https://github.com/yuquan-chen/edgelore/blob/main/src/agent/conflicts.ts" target="_blank" rel="noopener">冲突治理源码 ↗</a></details>`;
  const user=text=>`<article class="gov-message gov-user">${text}</article>`;
  const assistant=text=>`<article class="gov-message"><div class="gov-meta">Edgelore</div>${text}</article>`;
  const report=(title,body,attention=false)=>`<article class="gov-message gov-report ${attention?'attention':''}"><div class="report-label"><span>主动汇报</span><span>${title}</span></div>${body}</article>`;
  function snapshot(){return step===0?data.baseline:step===1?data.budgetConflict:step<=2?data.budgetResolved:choice&&choice!=='later'?data.branches[choice]:data.ownerConflict;}
  function selectNode(id){selected=id;draw();}
  function draw(){
    const snap=snapshot(),ids=data.ids,selectedNode=snap.nodes.find(n=>n.id===selected);
    const names={[ids.budgetDimension]:'预算',[ids.ownerDimension]:'负责人',[ids.budget]:'¥ 5,000',[ids.budgetNew]:'¥ 8,000',[ids.owner]:'Alice',[ids.ownerNew]:'Bob'};
    const xy={[ids.budgetDimension]:[200,82],[ids.ownerDimension]:[320,322],[ids.budget]:[93,198],[ids.budgetNew]:[306,193],[ids.owner]:[197,421],[ids.ownerNew]:[450,416]};
    let html='<defs><marker id="gov-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#3563e9"/></marker></defs>';
    html+='<path class="gov-edge" d="M221 71 L362 57"/><rect class="gov-rule" x="362" y="29" width="181" height="56" rx="10"/><text class="gov-rule-text" x="378" y="52">预算 ≤ ¥ 6,000</text><text class="gov-edge-label" x="378" y="72">已由用户启用 · 单维约束</text>';
    snap.nodes.filter(n=>n.type==='core:statement').forEach(n=>{const a=xy[n.dimension_id],b=xy[n.id];if(a&&b)html+=`<path class="gov-edge ${n.state==='superseded'?'history':''}" d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}"/>`;});
    const relations=snap.edges.filter(e=>['core:contradicts','core:supersedes'].includes(e.type));
    relations.forEach(e=>{
      const a=xy[e.from],b=xy[e.to];if(!a||!b)return;
      const retired=snap.nodes.find(n=>n.id===e.from)?.state==='superseded'||snap.nodes.find(n=>n.id===e.to)?.state==='superseded';
      if(e.type==='core:contradicts'&&retired)return;
      const resolved=e.type==='core:supersedes';const y=(a[1]+b[1])/2;
      html+=`<path class="gov-edge ${resolved?'resolved':'conflict'}" d="M${a[0]} ${a[1]-22} Q${(a[0]+b[0])/2} ${y-90} ${b[0]} ${b[1]-22}" ${resolved?'marker-end="url(#gov-arrow)"':''}/><text class="gov-edge-label" x="${(a[0]+b[0])/2}" y="${y+35}" text-anchor="middle">${resolved?'supersedes · 保留历史':'contradicts · 待裁决'}</text>`;
    });
    snap.nodes.forEach(n=>{
      const p=xy[n.id];if(!p)return;const dim=n.type==='core:dimension',radius=dim?19:23;
      const stateLabel=dim?(n.state==='conflict'?'存在冲突':'单值维度'):({accepted:'已采纳',tentative:'待确认',conflict:'存在冲突',superseded:'历史记录'})[n.state]||n.state;
      html+=`<g class="gov-node ${dim?'dimension':''} ${n.state} ${selected===n.id?'selected':''}" data-id="${esc(n.id)}" role="button" tabindex="0" aria-label="${esc(names[n.id]+'，'+stateLabel)}"><circle cx="${p[0]}" cy="${p[1]}" r="${radius}"/><text class="label" x="${p[0]}" y="${p[1]+radius+20}" text-anchor="middle">${esc(names[n.id])}</text><text class="sub" x="${p[0]}" y="${p[1]+radius+36}" text-anchor="middle">${esc(dim?(n.state==='conflict'?'存在冲突':'单值维度'):stateLabel)}</text></g>`;
    });
    $('gov-graph').innerHTML=html;
    $('gov-graph').querySelectorAll('[data-id]').forEach(el=>{el.onclick=()=>selectNode(el.dataset.id);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(el.dataset.id);}};});
    const target=selectedNode||snap.nodes.find(n=>n.id===(step>=3?ids.owner:ids.budget));
    const audit=relations.filter(e=>e.type==='core:supersedes'&&(e.from===target.id||e.to===target.id));
    $('gov-inspector').innerHTML=`<b>${esc(names[target.id])} <span style="color:#98a2b4;font-weight:400">/ ${esc(target.state)}</span></b><p>${target.source_refs?.length?'来源：'+esc(target.source_refs.join(' · ')):'维度状态来自核心输出'}${audit.length?' · 已保留裁决记录':''}</p><details><summary>查看原始状态与裁决依据</summary><pre>${esc(JSON.stringify({node:target,audit},null,2))}</pre></details>`;
    $('gov-pending').textContent=snap.conflicts.length;
  }
  function render(){
    const ownerFinal=choice&&choice!=='later';
    let html='<div class="gov-meta">项目 A · 以下为虚构演示场景</div>'+user('负责人是 Alice，预算 5,000 元。预算上限 6,000 元，启用这条规则来裁决预算冲突。')+assistant('<p>已记住负责人和预算，预算规则已启用。</p>');
    if(step>=1)html+=user('预算改成 8,000 元。');
    if(step===1)html+=assistant('<p>发现两个预算值，正在核对已启用的规则…</p>');
    if(step>=2)html+=report('已按规则处理','<p>预算仍采用 <strong>5,000 元</strong>。</p><p>新提出的 8,000 元不满足你已启用的「预算 ≤ 6,000 元」规则；只有原值满足条件，因此保留原值。</p><small>8,000 元进入历史记录，原话与规则依据均保留。</small>');
    if(step>=3)html+=user('项目负责人是 Bob。');
    if(step===3)html+=assistant('<p>这和之前的 Alice 不同。正在检查是否有足够依据裁决…</p>');
    if(step>=4)html+=report(ownerFinal?'已收到你的确认':choice==='later'?'已暂缓 · 仍待确认':'需要你确认',`<p>负责人出现两个值：<strong>Alice / Bob</strong>。</p><p>${ownerFinal?'当时没有可唯一裁决的已启用规则，因此请求人工确认。裁决结果见下方汇报。':'没有可唯一裁决的已启用规则。当前保留 Alice，Bob 等待确认。'}</p>${step===4?'<div class="gov-choices"><button data-decision="Bob">改为 Bob</button><button data-decision="Alice">保留 Alice</button><button data-decision="later" class="quiet">稍后确认</button></div>':'<small>冲突来源：demo:message:2 与 demo:message:4</small>'}`,!ownerFinal);
    if(step===5){
      if(ownerFinal)html+=user(choice==='Bob'?'确认改为 Bob。':'确认保留 Alice。')+report('处理完成',`<p>负责人已确认采用 <strong>${choice}</strong>，另一条记录转为历史。</p><p>这次共处理两处冲突：预算依据已启用规则裁决；负责人依据你的确认裁决。</p><div class="gov-summary-line"><span>已处理 <b>2</b></span><span>待确认 <b>0</b></span><span>历史记录保留</span></div>`);
      else html+=user('负责人稍后确认。')+report('待办已保留','<p>预算冲突已处理。负责人冲突仍待确认，继续保留两边来源。</p><div class="gov-summary-line"><span>已处理 <b>1</b></span><span>待确认 <b>1</b></span></div><div class="gov-choices"><button id="gov-review">现在处理负责人冲突</button></div>',true);
    }
    $('gov-messages').innerHTML=html;$('gov-messages').scrollTop=$('gov-messages').scrollHeight;
    $('gov-input').value=step===0?'预算改成 8,000 元。':step===2?'项目负责人是 Bob。':step===4?'上方有一条冲突需要你确认。':step===5?'本轮汇报完成。可以点击图中的节点，追溯每条记忆。':'正在检查记忆与规则…';
    $('gov-send').disabled=![0,2].includes(step);$('gov-send').textContent=step===5?'✓':'↑';
    $('gov-hint').textContent=step===4?'等待确认':step===5?'演示完成':'预设消息 · 点击发送';
    $('gov-status').textContent=['规则已启用 · 等待下一条消息','发现预算冲突 · 正在核对规则','预算冲突已处理 · 已主动汇报','发现负责人冲突 · 正在核对依据','没有足够裁决依据 · 已主动请求确认',choice==='later'?'预算已处理 · 负责人仍待确认':'两处冲突已处理 · 已主动汇报'][step];
    root.querySelectorAll('.gov-step').forEach((el,i)=>el.classList.toggle('active',i===(step===0?0:[1,3].includes(step)?1:2)));
    root.querySelectorAll('[data-decision]').forEach(b=>b.onclick=()=>{choice=b.dataset.decision;step=5;selected=choice==='Bob'?data.ids.ownerNew:data.ids.owner;render();});
    if($('gov-review'))$('gov-review').onclick=()=>{choice=null;step=4;render();};
    draw();
  }
  function advance(){clearTimeout(timer);step=step===0?1:3;selected=step===1?data.ids.budgetNew:data.ids.ownerNew;render();settle();}
  function settle(){if(![1,3].includes(step))return;timer=setTimeout(()=>{step+=1;selected=step===2?data.ids.budget:data.ids.ownerNew;render();},1100);}
  $('gov-send').onclick=advance;$('gov-restart').onclick=()=>{clearTimeout(timer);step=0;choice=null;selected=null;if(data)render();};
  document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
    const archive=button.dataset.mode==='archive';$('archive-replay').hidden=!archive;root.hidden=archive;
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.querySelector('.archive-tag').lastChild.textContent=archive?'真实测评记录 · 本地回放':'虚构场景 · 核心输出回放';
    clearTimeout(timer);if(!archive)settle();else document.dispatchEvent(new Event('edgelore-archive-open'));
  });
  fetch('./conflict-case.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(value=>{data=value;if(data.automatic.status!=='resolved'||data.escalation.status!=='escalated')throw Error('Unexpected core output');render();}).catch(()=>{root.innerHTML='<p class="gov-loading">场景数据读取失败，请刷新重试。</p>';});
})();
