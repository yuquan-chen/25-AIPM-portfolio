(() => {
  'use strict';
  const $=id=>document.getElementById(id), svg=$('atlas');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const positions=new Map(), camera={x:0,y:0,k:1};
  const anchors=[[167,152],[491,152],[167,400],[491,400]];
  const labels=['参与案例竞赛','选择 Tableau','工具建议','仪表盘设计','Tableau 流程','竞赛图表','竞赛指标','成果展示','特征工程','独立项目','图表组合','正式演示','特征建议','变量处理','可视化建议','汇报建议','带领分析组','汇报经验','比较聚类','聚类选型','数据准备','聚类图表','视觉编码','项目经历','会议海报','继续研究','信任与认同'];
  let state,drag=null,suppress=false;
  const pos=(key,x,y)=>{if(!positions.has(key))positions.set(key,{x,y});return positions.get(key);};
  function transform(){svg.querySelector('.graph-world')?.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.k})`);}
  function zoom(factor,cx=svg.viewBox.baseVal.x+svg.viewBox.baseVal.width/2,cy=svg.viewBox.baseVal.y+svg.viewBox.baseVal.height/2){const next=Math.max(.65,Math.min(2.6,camera.k*factor)),r=next/camera.k;camera.x=cx-(cx-camera.x)*r;camera.y=cy-(cy-camera.y)*r;camera.k=next;transform();}
  window.drawMemoryGraph=function(input){
    state=input;const {data,all,selected,cursor,latest,titles,claimTexts,sessionOfClaim,onSelect}=input;
    const nodes=[],edges=[],s=selected==null?-1:sessionOfClaim(selected);
    if(all.length)nodes.push({key:'owner',...pos('owner',330,275),r:24,type:'owner',label:'用户',sub:'记忆主体'});
    data.sessions.forEach((session,j)=>{
      const members=all.filter(i=>sessionOfClaim(i)===j),[x,y]=anchors[j];
      if(!members.length)return;
      nodes.push({key:'session'+j,...pos('session'+j,x,y),r:25,type:'session',label:titles[j],sub:`${members.length} 条记忆`,inactive:!members.length,source:j});
      const total=data.claims.map((c,i)=>i).filter(i=>sessionOfClaim(i)===j);
      total.forEach((i,slot)=>{
        if(!all.includes(i))return;
        const angle=-Math.PI/2+slot/total.length*Math.PI*2,c=data.claims[i];
        nodes.push({key:'claim'+i,...pos('claim'+i,x+Math.cos(angle)*105,y+Math.sin(angle)*91),r:c.state==='tentative'?10:13,type:'memory',label:labels[i],claim:i,tentative:c.state==='tentative',fresh:latest.includes(i),selected:i===selected,supporting:cursor===23&&[9,16].includes(i)});
        edges.push({from:'session'+j,to:'claim'+i,type:'source',active:i===selected,label:'source_refs'});
      });
      if(members.length)edges.push({from:'owner',to:'session'+j,type:'scope',active:j===s,label:'同一 owner_id'});
    });
    data.storedEdges.forEach((edge,j)=>{
      const i=data.claims.findIndex(c=>c.id===edge.from);if(!all.includes(i))return;
      nodes.push({key:'entity'+j,...pos('entity'+j,330,j===0?49:501),r:16,type:'entity',label:j===0?'案例竞赛':'学术会议',claim:i});
      edges.push({from:'claim'+i,to:'entity'+j,type:'about',active:i===selected,label:'about'});
    });
    if(nodes.some(n=>n.key==='claim'+selected)){
      nodes.push({key:'dimension'+selected,...pos('dimension'+selected,330,s<2?155:395),r:10,type:'dimension',label:'记忆维度',sub:data.claims[selected].dimension.cardinality==='single'?'单值':'多值',claim:selected});
      edges.push({from:'dimension'+selected,to:'claim'+selected,type:'dimension',active:true,label:'dimension_id'});
    }
    const byKey=new Map(nodes.map(n=>[n.key,n]));
    let html='<g class="graph-world">';
    edges.forEach(e=>{const a=byKey.get(e.from),b=byKey.get(e.to);html+=`<g class="network-edge ${e.type} ${e.active?'active':''}"><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><title>${esc(e.label)}</title>${e.active&&e.type==='about'?`<text x="${(a.x+b.x)/2}" y="${(a.y+b.y)/2-5}">about</text>`:''}</g>`;});
    nodes.forEach(n=>{
      const attrs=n.claim!=null?`data-claim="${n.claim}"`:n.source!=null&&!n.inactive?`data-source="${n.source}"`:'';
      const shape=n.type==='entity'?'<path class="node-core" d="M0 -17 L15 -9 L15 9 L0 17 L-15 9 L-15 -9 Z"/>':n.type==='dimension'?'<path class="node-core" d="M0 -11 L11 0 L0 11 L-11 0 Z"/>':`<circle class="node-core" r="${n.r}"/>`;
      html+=`<g transform="translate(${n.x} ${n.y})" class="network-node ${n.type} ${n.inactive?'inactive':''} ${n.tentative?'tentative':''} ${n.fresh?'fresh':''} ${n.selected?'selected':''} ${n.supporting?'supporting':''}" data-node="${n.key}" ${attrs} ${attrs?'role="button" tabindex="0"':''} aria-label="${esc(n.claim!=null?claimTexts[n.claim][0]:n.label)}"><title>${esc(n.claim!=null?claimTexts[n.claim][0]:n.label)}${n.type==='memory'?(n.tentative?' · 待确认':' · 已采纳'):''}</title>${n.selected||n.fresh?`<circle class="node-halo" r="${n.r+7}"/>`:''}${shape}<rect class="node-core pixel-core" x="${-n.r}" y="${-n.r}" width="${n.r*2}" height="${n.r*2}"/>${n.type==='owner'?'<text class="owner-label" text-anchor="middle" y="4">我</text>':''}<text class="node-label" text-anchor="middle" y="${n.r+18}">${esc(n.label)}</text>${n.sub?`<text class="node-sub" text-anchor="middle" y="${n.r+32}">${esc(n.sub)}</text>`:''}</g>`;
    });
    // Fit the currently revealed graph instead of reserving space for future sessions.
    if(nodes.length){
      const left=Math.min(...nodes.map(n=>n.x-65)),top=Math.min(...nodes.map(n=>n.y-n.r-20));
      const right=Math.max(...nodes.map(n=>n.x+65)),bottom=Math.max(...nodes.map(n=>n.y+n.r+48));
      svg.setAttribute('viewBox',`${left} ${top} ${right-left} ${bottom-top}`);
    }else svg.setAttribute('viewBox','0 0 660 550');
    svg.innerHTML=html+'</g>';transform();$('graph-size').textContent=`${nodes.length} NODES`;
    $('atlas-note').textContent=cursor===23?'两条项目记忆高亮，支持跨会话回答。点击节点核对证据。':'实线：已存 about 关系 · 虚线：来源、归属与维度字段';
    svg.querySelectorAll('[data-claim],[data-source]').forEach(el=>{
      const select=()=>{if(suppress)return;onSelect(el.dataset.claim!=null?Number(el.dataset.claim):all.find(i=>sessionOfClaim(i)===Number(el.dataset.source)));};
      el.addEventListener('click',select);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
    });
  };
  function point(e){const m=svg.getScreenCTM();return m?new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()):null;}
  svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=point(e);if(!p)return;drag={key:e.target.closest('[data-node]')?.dataset.node,start:p,last:p,moved:false};suppress=false;});
  svg.addEventListener('pointermove',e=>{
    if(!drag)return;const p=point(e);if(!p)return;const dx=p.x-drag.last.x,dy=p.y-drag.last.y;
    if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>4){drag.moved=true;svg.setPointerCapture(e.pointerId);}
    if(drag.moved){if(drag.key){const n=positions.get(drag.key);n.x+=dx/camera.k;n.y+=dy/camera.k;window.drawMemoryGraph(state);}else{camera.x+=dx;camera.y+=dy;transform();}}
    drag.last=p;
  });
  function endDrag(){if(drag){suppress=drag.moved;drag=null;setTimeout(()=>suppress=false,0);}}
  window.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  svg.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const p=point(e);if(p)zoom(e.deltaY>0?.9:1.1,p.x,p.y);},{passive:false});
  $('zoom-in').addEventListener('click',()=>zoom(1.2));$('zoom-out').addEventListener('click',()=>zoom(1/1.2));
  $('graph-reset').addEventListener('click',()=>{camera.x=0;camera.y=0;camera.k=1;positions.clear();if(state)window.drawMemoryGraph(state);});
})();
