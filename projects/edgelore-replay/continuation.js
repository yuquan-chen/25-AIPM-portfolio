(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data, chosen=null, selected=null, phase=0, checking=false;
  const snap=()=>phase===24?data.baseline:phase===25?(checking?data.budgetConflict:data.budgetResolved):chosen&&chosen!=='later'?data.branches[chosen]:data.ownerConflict;
  const report=(body,attention=false)=>`<article class="message assistant inline-report ${attention?'attention':''}"><div class="message-meta">Edgelore · 主动汇报 · 演示续篇</div>${body}</article>`;
  const user=text=>`<article class="message user"><div class="message-meta">演示续篇 · 虚构输入</div><div class="bubble"><p>${text}</p></div></article>`;
  function names(){const i=data.ids;return {[i.budget]:'¥ 5,000',[i.budgetNew]:'¥ 8,000',[i.owner]:'Alice',[i.ownerNew]:'Bob',[i.budgetDimension]:'预算',[i.ownerDimension]:'负责人'};}
  window.replayContinuation={
    load:()=>fetch('./conflict-case.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(d=>{data=d;}),
    reset(){chosen=null;selected=null;},
    choose(value){chosen=value;selected=value==='Bob'?data.ids.ownerNew:data.ids.owner;},
    set(p,busy){phase=p;checking=busy;},
    pending:()=>phase>=24?snap().conflicts.length:0,
    counts(){const n=snap().nodes.filter(n=>n.type==='core:statement');return {total:n.length,accepted:n.filter(n=>n.state==='accepted').length,tentative:n.filter(n=>n.state==='tentative').length};},
    selection:()=>selected,
    messages(){
      let html='<div class="session-divider">演示续篇 · 接下来使用虚构项目 A，展示冲突处理<br>核心状态来自本地 Edgelore 输出，汇报时序为前端编排</div>';
      html+=user('新建项目 A：负责人 Alice，预算 5,000 元。启用预算上限 6,000 元，按这条规则处理预算冲突。');
      html+=report('<p>已记住负责人和预算，并启用你批准的预算规则。</p>');
      if(phase>=25){html+=user('项目 A 的预算改成 8,000 元。');html+=phase===25&&checking?report('<p>发现预算冲突，正在核对已启用的规则…</p>'):report('<p>预算仍采用 <strong>5,000 元</strong>。</p><p>8,000 元不满足你批准的「预算 ≤ 6,000 元」规则；只有原值满足条件。新提议保留为历史，裁决依据可在右侧查看。</p>');}
      if(phase>=26){html+=user('项目 A 的负责人改成 Bob。');
        if(phase===27)html+=report('<p>此前发现负责人 Alice / Bob 冲突，缺少唯一裁决依据，已请求你确认。</p>',true);
        if(checking)html+=report('<p>发现 Alice / Bob 两个负责人，正在核对裁决依据…</p>');
        else if(phase===26)html+=report('<p>负责人出现 <strong>Alice / Bob</strong> 两个值，没有能唯一裁决的已启用规则。请你确认：</p><div class="gov-choices"><button data-resolve="Bob">改为 Bob</button><button data-resolve="Alice">保留 Alice</button><button data-resolve="later" class="quiet">稍后确认</button></div>',true);
        else if(chosen==='later')html+=user('负责人稍后确认。')+report('<p>预算冲突已处理；负责人仍待确认。当前继续采用 Alice，保留 Bob 的提议及两边来源。</p><p>已处理 1 · 待确认 1</p><div class="gov-choices"><button data-review-conflict>现在确认负责人</button></div>',true);
        else html+=user(`确认${chosen==='Bob'?'改为 Bob':'保留 Alice'}。`)+report(`<p>负责人已确认采用 <strong>${esc(chosen)}</strong>，另一条记录转为历史。</p><p>已处理 2 · 待确认 0</p><p>预算依据已启用规则裁决，负责人依据你的确认裁决；原话与裁决来源均保留。</p>`);
      }
      return html;
    },
    next(p){return p===23?'新建项目 A：负责人 Alice，预算 5,000 元。启用预算上限 6,000 元。':p===24?'项目 A 的预算改成 8,000 元。':p===25?'项目 A 的负责人改成 Bob。':p===26?'请在对话中确认负责人，或选择稍后处理。':'回放完成。可以回看对话、记忆与冲突处理结果。';},
    evidence(id=selected){
      const s=snap(),n=s.nodes.find(n=>n.id===id)||s.nodes.find(n=>n.id===(phase>=26?data.ids.ownerNew:data.ids.budget));selected=n.id;
      const audit=s.edges.filter(e=>(e.from===n.id||e.to===n.id)&&['core:contradicts','core:supersedes'].includes(e.type));
      return `<p class="evidence-title">${esc(names()[n.id])} · ${esc(n.state)}</p><div class="evidence-source">演示续篇 · ${esc((n.source_refs||[]).join(' · '))}</div><details class="evidence-original"><summary>查看核心状态与裁决依据</summary><pre>${esc(JSON.stringify({node:n,audit},null,2))}</pre></details>`;
    },
    draw(onSelect){
      const s=snap(),i=data.ids,ns=names(),xy={[i.budgetDimension]:[210,90],[i.budget]:[100,210],[i.budgetNew]:[330,210],[i.ownerDimension]:[345,325],[i.owner]:[210,435],[i.ownerNew]:[480,435]};
      let out='<g class="graph-world"><g transform="translate(5 0) scale(1.1)"><defs><marker id="inline-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#3563e9"/></marker></defs><text class="gov-rule-text" x="30" y="28">项目 A · 演示续篇的记忆</text><rect class="gov-rule" x="350" y="44" width="210" height="52" rx="9"/><text class="gov-rule-text" x="363" y="66">已启用：预算 ≤ ¥ 6,000</text><text class="gov-edge-label" x="363" y="84">经用户批准 · 单维约束</text><path class="gov-edge" d="M230 90 L350 70"/>';
      s.nodes.filter(n=>n.dimension_id).forEach(n=>{const a=xy[n.dimension_id],b=xy[n.id];out+=`<path class="gov-edge ${n.state==='superseded'?'history':''}" d="M${a} L${b}"/>`;});
      s.edges.filter(e=>['core:contradicts','core:supersedes'].includes(e.type)).forEach(e=>{const a=xy[e.from],b=xy[e.to];if(!a||!b)return;const resolved=e.type==='core:supersedes';if(!resolved&&s.nodes.some(n=>(n.id===e.from||n.id===e.to)&&n.state==='superseded'))return;const y=(a[1]+b[1])/2;out+=`<path class="gov-edge ${resolved?'resolved':'conflict'}" d="M${a[0]} ${a[1]-23} Q${(a[0]+b[0])/2} ${y-85} ${b[0]} ${b[1]-23}" ${resolved?'marker-end="url(#inline-arrow)"':''}/><text class="gov-edge-label" x="${(a[0]+b[0])/2}" y="${y-24}" text-anchor="middle">${resolved?'替代 · 保留历史':'冲突 · 待裁决'}</text>`;});
      s.nodes.forEach(n=>{const p=xy[n.id];if(!p)return;const dim=n.type==='core:dimension',label=dim?(n.state==='conflict'?'存在冲突':'单值维度'):({accepted:'已采纳',tentative:'待确认',superseded:'历史记录'})[n.state];out+=`<g class="gov-node ${dim?'dimension':''} ${n.state} ${selected===n.id?'selected':''}" data-continuation-id="${n.id}" role="button" tabindex="0" aria-label="${esc(ns[n.id]+'，'+label)}"><circle cx="${p[0]}" cy="${p[1]}" r="${dim?17:22}"/><rect class="pixel-core" x="${p[0]-(dim?17:22)}" y="${p[1]-(dim?17:22)}" width="${dim?34:44}" height="${dim?34:44}"/><text class="label" x="${p[0]}" y="${p[1]+41}" text-anchor="middle">${esc(ns[n.id])}</text><text class="sub" x="${p[0]}" y="${p[1]+57}" text-anchor="middle">${label}</text></g>`;});
      const svg=document.getElementById('atlas');svg.setAttribute('viewBox','0 0 660 580');svg.innerHTML=out+'</g></g>';
      svg.querySelectorAll('[data-continuation-id]').forEach(el=>{const select=()=>{selected=el.dataset.continuationId;onSelect(selected);};el.onclick=select;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};});
      document.getElementById('graph-size').textContent=`${s.nodes.length} NODES · 冲突局部`;
      document.getElementById('atlas-note').textContent='聚焦正在处理的项目 A；原来的 27 条缓存记忆仍可通过「全部记忆」查看。';
    }
  };
})();
