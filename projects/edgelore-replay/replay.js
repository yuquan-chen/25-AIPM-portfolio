(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const titles = ['案例竞赛','数据挖掘','营销研究','学术交流'];
  const userTexts = [
    '最近参加了咨询公司举办的案例竞赛，需要分析商业案例并向评委展示建议。有什么容易上手的数据可视化工具？',
    '我想先试试 Tableau 和 Power BI。怎样才能在这些工具里做出有效的仪表盘？',
    '我先用 Tableau 吧，感觉更容易上手。能介绍一下连接数据、创建仪表盘和发布的过程吗？',
    '我想用 Tableau 展示案例竞赛里的关键指标。什么图表更适合表达我们团队的分析和建议？',
    '图表有思路了，但具体该选哪些指标和数据点？帮我想想适合案例竞赛的指标。',
    '我正在用 Python 和 R 构建预测模型，但特征工程遇到了困难。有什么学习建议？',
    '我在做数据挖掘课的独立项目，分析客户购买数据中的模式与趋势。高基数类别变量该怎么处理？',
    '我会试试分组和分箱。分析结果怎样可视化，才能让教授和同学容易理解？',
    '我想用柱状图、散点图、热力图和交互图表来讲清楚故事。最后做正式演示，还是书面报告？',
    '我决定做一个结构清楚的正式演示，突出关键发现，提前练习，也考虑加入交互。怎样让听众保持兴趣？',
    '想讨论的都聊到了，谢谢。这次交流让我更有信心向教授和同学展示项目了。',
    '我在分析客户数据，想比较 k-means 和层次聚类。以前在营销研究课项目中，我带领数据分析小组，做过新产品上市的综合市场分析。',
    '我倾向于先试 k-means，但不确定聚类数量。该怎么确定合适的簇数？',
    '我会先试肘部法和轮廓分析。聚类前的数据应该怎样准备，需要归一化或缩放吗？',
    '我想通过可视化发现客户数据里的模式和结构，适合用哪些图？',
    '我会先试散点图、热力图，以及 PCA 或 t-SNE。营销研究课项目里，我们也做过面向利益相关者的报告和演示。配色有什么建议？',
    '我会试试这些可视化方法，也会注意高维数据降维后的表达。谢谢建议。',
    '最近在消费者心理学会议上，展示了关于社交媒体影响者如何影响购买决策的研究海报。我想继续研究，有哪些相关论文？',
    '我尤其想了解可信度与信任。社交媒体影响者怎样建立关注者的信任？',
    '真实性在建立可信度中有什么作用？消费者怎么看待影响者的真实性？',
    '社会认同理论如何解释影响者营销的效果？又如何帮助影响者与受众建立联系？',
    '结合我的购买决策研究，影响者怎样通过社会认同提高品牌认知、促进销售？'
  ];
  const claimTexts = [
    ['参加案例竞赛','分析商业案例，向评委展示团队建议。'],['先从 Tableau 开始','也考虑 Power BI，用于案例竞赛展示。'],['可视化工具建议','助手推荐 Tableau、Power BI、D3.js 等。'],['仪表盘设计建议','明确受众，保持简单，选择合适图表。'],['Tableau 操作流程','连接数据、构建仪表盘、发布与分享。'],['竞赛图表建议','绩效仪表盘、市场分析与客户细分等。'],['竞赛指标建议','财务、运营、客户、市场与创新指标。'],
    ['面向教授与同学展示','希望清楚地呈现客户购买数据分析结果。'],['学习 Python / R 特征工程','关注高基数类别变量的处理。'],['独立完成数据挖掘项目','通过客户购买数据识别模式与趋势。'],['准备组合使用多种图表','柱状图、散点图、热力图与交互可视化。'],['决定做正式演示','结构清楚、突出发现，并提前练习。'],['特征工程学习建议','领域知识、探索数据、变换与特征选择。'],['类别变量处理建议','分组、编码、嵌入与降维等方法。'],['分析结果可视化建议','按数据类型选图，组织清楚的叙事。'],['成果汇报建议','正式演示或报告；注意结构与互动。'],
    ['带领营销研究的数据分析组','为新产品上市做综合市场分析。'],['有面向利益相关者的展示经验','曾在营销研究项目中制作报告与演示。'],['正在比较聚类方法','倾向 k-means，尚不确定簇的数量。'],['聚类选型建议','先试 k-means，用肘部法与轮廓分析。'],['聚类前的数据准备建议','处理缺失值，缩放数据与选择特征。'],['聚类可视化建议','散点图、热力图和降维后的图形。'],['视觉编码建议','保持配色一致，避免过多视觉编码。'],['营销研究项目的综合记录','带领分析组，并向利益相关者汇报。'],
    ['曾在学术会议展示海报','主题是影响者对消费者购买决策的影响。'],['希望继续推进影响者研究','已有海报展示，准备拓展研究。'],['关注可信度与社会认同','研究兴趣包括信任、真实性与社会认同。']
  ];
  // Reveal assignments are editorial, never presented as per-turn ingestion events.
  const reveals = [[0,2],[1,3],[4],[5],[6],[8,12],[9,13],[7,14],[10],[11,15],[],[16,18,19],[],[20],[21],[17,22,23],[],[24,25],[26],[],[],[]];
  const boundaries = [0,5,11,17,22];
  const assistantTexts = [
    '当时的回复介绍了 Tableau、Power BI 等工具，以及它们的可视化与交互能力。',
    '先明确受众、保持简洁，再选择合适的图表与清晰的结构。',
    '回复依次介绍了连接数据源、创建仪表盘，以及发布和分享的步骤。',
    '可以从公司绩效仪表盘、行业格局等角度组织图表。',
    '指标取决于案例与建议；回复列举了财务、运营、客户等类别。',
    '先理解业务与数据，再探索、可视化，逐步构建与筛选特征。',
    '回复比较了分组分箱、编码等处理高基数类别变量的方法。',
    '可以用柱状图做类别比较、散点图看关系、热力图看整体模式。',
    '回复比较了正式演示和书面报告，并给出组织与表达建议。',
    '用一个引子开场，通过故事与互动帮助听众跟上分析。',
    '原助手回应了用户的感谢，并鼓励继续完善项目展示。',
    '回复结合数据特点，比较了 k-means 和层次聚类的适用情况。',
    '可以参考肘部法、轮廓分析和 Gap Statistic 来选择簇数。',
    '聚类前先处理缺失值，并考虑特征的归一化或缩放。',
    '回复建议用散点图、成对散点图和热力图观察数据关系。',
    '保持配色一致，让颜色表达含义，并避免过度编码。',
    '原助手建议继续尝试不同可视化方法，找到适合数据的表达。',
    '当时的回复列举了影响者营销与购买决策相关的论文建议。',
    '回复从专业性、相关性等角度讨论影响者的可信度与信任。',
    '回复讨论了表达风格的一致性，以及分享个人经历等方式。',
    '回复用群体归属与共同价值观解释影响者与受众的联系。',
    '回复讨论了面向特定群体、表达共同价值观等营销思路。'
  ];
  if(window.parent===window)document.body.classList.add('standalone');
  let data, rounds=[], cursor=0, selected=null, running=false, timer=null, visible=true, settling=false, settleTimer=null, showArchive=false;
  const continuation=window.replayContinuation;
  const archiveLegend=document.querySelector('.graph-legend').innerHTML;
  const revealed = () => [...new Set(reveals.slice(0,Math.min(cursor,22)).flat())];
  const sessionOfClaim = index => data.sessions.findIndex(s => data.claims[index].source_refs.includes(s.id));
  const stop = () => {running=false;clearTimeout(timer);$('play').textContent='▷ 播放';};
  function schedule(){clearTimeout(timer);if(running&&visible&&!document.hidden) timer=setTimeout(() => {if(cursor>=26){stop();return;}move(cursor+1);schedule();},4200);}
  function move(next){clearTimeout(settleTimer);settling=false;cursor=Math.max(0,Math.min(27,next));showArchive=false;if(cursor<=26)continuation.reset();const now=cursor>0&&cursor<=22?reveals[cursor-1]:[];const all=revealed();selected=cursor===23?16:(now.find(i=>data.claims[i].state==='accepted')??now[0]??(all.includes(selected)?selected:all[all.length-1])??null);settling=[25,26].includes(cursor);render();if(settling)settleTimer=setTimeout(()=>{settling=false;render();},1100);}
  function sessionIndex(){return cursor>=23?4:Math.max(0,boundaries.findIndex((n,i)=>i<4&&cursor>n&&cursor<=boundaries[i+1]));}
  function renderMessages(){
    let html='';
    for(let i=0;i<Math.min(cursor,22);i++){
      const r=rounds[i];
      if(i===boundaries[r.session]) html+=`<div class="session-divider">${esc(data.sessions[r.session].date.slice(0,10))} · ${esc(titles[r.session])} / 会话 ${r.session+1}</div>`;
      html+=`<article class="message user"><div class="message-meta"><span>用户 · 中文节选</span><span>${String(i+1).padStart(2,'0')}</span></div><div class="bubble"><p>${esc(userTexts[i])}</p><details><summary>对照英文原话</summary><div class="markdown-body">${window.renderReplayMarkdown(r.user.content)}</div></details></div></article>`;
      // Keep the original assistant response available without manufacturing a translated reply.
      html+=`<article class="message assistant"><div class="message-meta">原助手回复 · 中文概括</div><div class="bubble"><p>${esc(assistantTexts[i])}</p><details><summary>查看当时的英文回复</summary><div class="markdown-body">${window.renderReplayMarkdown(r.assistant?.content||'无回复记录')}</div></details></div><div class="message-note">${reveals[i].length?`展开 ${reveals[i].length} 条相关记忆`:'继续讨论 · 无新展开的记忆'}</div></article>`;
    }
    if(cursor>=23) html+=`<div class="session-divider">新的提问 / 跨会话记忆</div><article class="message user"><div class="message-meta">测评问题 · 中文译文</div><div class="bubble"><p>我带领过、或正在带领多少个项目？</p></div></article><article class="message assistant recall-result"><div class="message-meta">缓存回答 · 中文节选</div><p>你带领过、或正在带领 <strong>2 个项目</strong>：</p><p>① 营销研究课程项目：带领数据分析小组。<br>② 数据挖掘课程项目：独立分析客户购买数据。</p><p style="margin-top:12px">案例竞赛的记录只提到参与和展示，没有表明你担任负责人，因此未计入。</p><details><summary>查看保存的完整英文回答</summary><div class="markdown-body">${window.renderReplayMarkdown(data.cachedAnswer)}</div></details></article>`;
    if(cursor>=24)html+=continuation.messages();
    $('messages').innerHTML=html||'<p class="ghost-hint">一句话，留下哪些记忆？<small>发送下方对话，看记忆与来源一起出现。<br>22 轮缓存回放，可逐轮查看原文。</small></p>';
    $('messages').scrollTop=$('messages').scrollHeight;
    $('messages').querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>{continuation.choose(b.dataset.resolve);cursor=27;render();});
    $('messages').querySelector('[data-review-conflict]')?.addEventListener('click',()=>move(26));
  }
  function renderGraph(){
    if(cursor>=24&&!showArchive){continuation.draw(id=>{$('evidence').innerHTML=continuation.evidence(id);renderGraph();});return;}
    window.drawMemoryGraph({data,all:revealed(),selected,cursor,latest:cursor>0&&cursor<=22?reveals[cursor-1]:[],titles,claimTexts,sessionOfClaim,onSelect:index=>{selected=index;renderMemory();}});
  }
  function renderEvidence(){
    if(cursor>=24&&!showArchive){$('evidence').innerHTML=continuation.evidence();return;}
    const c=data.claims[selected];
    if(!c){$('evidence').innerHTML='<p class="evidence-title">点击记忆，查看原始声明和它的来源。</p>';return;}
    const s=sessionOfClaim(selected),roundIndex=reveals.findIndex(group=>group.includes(selected)),r=rounds[roundIndex],quote=c.saidBy==='assistant'?r.assistant?.content:r.user.content;
    $('evidence').innerHTML=`<p class="evidence-title">${esc(claimTexts[selected][0])}</p><div class="evidence-source">${esc(c.state)} · ${esc(c.source_refs[0])}</div><details class="evidence-original"><summary>核对缓存原文与来源 ↗</summary><p><b>缓存声明：</b></p><div class="markdown-body">${window.renderReplayMarkdown(c.value)}</div><p><b>真实维度：</b>${esc(c.dimension.key)}<br><b>声明 ID：</b>${esc(c.id)}</p><p>来源会话中的片段 · 人工定位</p><div class="markdown-body">${window.renderReplayMarkdown(quote||'请在左侧展开该会话原文。')}</div><p>来源记录指向会话 ${s+1}；这里的逐轮展示位置不代表入库时刻。</p></details>`;
  }
  function renderMemory(){
    const all=revealed(), accepted=all.filter(i=>data.claims[i].state==='accepted').length;
    $('memory-count').textContent=all.length;$('accepted-count').textContent=accepted;$('tentative-count').textContent=all.length-accepted;
    $('memory-select').innerHTML=all.length?data.sessions.map((s,n)=>all.some(i=>sessionOfClaim(i)===n)?`<optgroup label="${titles[n]}">${all.filter(i=>sessionOfClaim(i)===n).map(i=>`<option value="${i}" ${selected===i?'selected':''}>${String(i+1).padStart(2,'0')} · ${esc(claimTexts[i][0])}</option>`).join('')}</optgroup>`:'').join(''):'<option>尚无记忆</option>';
    $('memory-select').disabled=!all.length;$('memory-select').hidden=cursor>=24&&!showArchive;
    $('graph-focus').hidden=cursor<24;$('graph-focus').textContent=showArchive?'返回当前冲突':'全部记忆';
    $('memory-count').textContent=all.length;$('memory-total').textContent=cursor>=24?`条缓存 · ${continuation.pending()} 处待裁决`:'/ 27 条';
    const focused=cursor>=24&&!showArchive;
    document.querySelector('.graph-legend').innerHTML=focused?'<span><i class="legend-memory"></i>已采纳</span><span><i style="background:#e0b27a"></i>待确认</span><span><i style="background:#d8dce5"></i>历史记录</span><span class="graph-tip">点击节点核对依据</span>':archiveLegend;
    if(focused){const n=continuation.counts();$('memory-count').textContent=n.total;$('memory-total').textContent=`条项目记忆 · ${continuation.pending()} 处待裁决`;$('accepted-count').textContent=n.accepted;$('tentative-count').textContent=n.tentative;}
    renderGraph();renderEvidence();
  }
  function render(){
    continuation.set(cursor,settling);
    const current=sessionIndex();$('session-title').textContent=cursor>=24?'项目 A · 演示续篇':cursor===23?'换个会话，再问一次':cursor===0?'开始一段对话':titles[current];$('session-date').textContent=cursor>=24?'虚构输入 · 核心输出':cursor===23?'跨会话提问':cursor===0?'':data.sessions[current].date.slice(0,10);
    document.querySelectorAll('[data-jump]').forEach(b=>b.setAttribute('aria-current',String((Number(b.dataset.jump)===23?4:boundaries.indexOf(Number(b.dataset.jump)-1))===current&&cursor>0&&cursor<24)));
    $('next-message').value=settling?'正在核对记忆与规则…':cursor<22?userTexts[cursor]:cursor===22?'我带领过、或正在带领多少个项目？':continuation.next(cursor);
    $('send').disabled=cursor>=26||settling;$('send').textContent=cursor===27?'✓':'↑';const sendLabel=cursor===22?'提出跨会话问题':cursor>=26?'等待确认或回放完成':'发送下一轮';$('send').setAttribute('aria-label',sendLabel);$('send').title=sendLabel;
    $('composer-label').textContent=cursor===22?'最后，换一个会话提问':'下一轮 · 中文节选';$('turn-count').textContent=`${String(Math.min(cursor,22)).padStart(2,'0')} / 22`;
    $('scrub').value=cursor;$('progress-label').textContent=cursor===23?'跨会话提问':`${String(cursor).padStart(2,'0')} / 22`;
    const changes=cursor>0&&cursor<=22?reveals[cursor-1].length:0;$('change-status').textContent=cursor===23?'缓存答案 · 对照依据':changes?`本轮展开 ${changes} 条缓存声明`:'没有新展开的声明';
    if(cursor>=23){$('composer-label').textContent='继续同一段聊天 · 演示续篇';$('turn-count').textContent='22 / 22 · 续篇';$('progress-label').textContent=cursor===23?'跨会话提问':`续篇 ${Math.min(cursor-23,3)} / 3`;$('change-status').textContent=cursor>=24?settling?'正在检查冲突':cursor===24?'已记住 · 规则已启用':cursor===25?'预算已处理 · 已汇报':continuation.pending()?'负责人待确认 · 已汇报':'冲突已处理 · 已汇报':'缓存答案 · 对照依据';}
    document.querySelector('.archive-tag').lastChild.textContent=cursor>=24?'演示续篇 · 虚构输入':'22 轮真实记录 · 本地回放';
    renderMessages();renderMemory();if(cursor>=26)stop();
  }
  $('send').addEventListener('click',()=>{stop();move(cursor+1);});$('reset').addEventListener('click',()=>{stop();move(0);});$('scrub').addEventListener('input',()=>{stop();move(Number($('scrub').value));});
  $('play').addEventListener('click',()=>{if(running){stop();return;}if(cursor>=26)move(0);running=true;$('play').textContent='Ⅱ 暂停';schedule();});
  $('graph-focus').addEventListener('click',()=>{showArchive=!showArchive;renderMemory();});
  $('graph-reset').addEventListener('click',()=>{if(cursor>=24&&!showArchive)renderGraph();});
  document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>{stop();move(Number(b.dataset.jump));}));$('memory-select').addEventListener('change',()=>{selected=Number($('memory-select').value);renderMemory();});
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',stop));document.addEventListener('visibilitychange',schedule);window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='edgelore-replay-visible'){visible=Boolean(e.data.visible);schedule();}});
  if(window.parent!==window){
    window.addEventListener('message',e=>{
      if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='edgelore-scene'||!data)return;
      const turn=Number(e.data.turn);if(!Number.isInteger(turn)||turn<0||turn>26)return;
      stop();move(turn);parent.postMessage({type:'edgelore-scene-applied'},location.origin);
    });
    // The document height is at least the iframe viewport height, so measuring
    // it prevents an expanded embed from shrinking when its content contracts.
    const panel=$('replay');
    let lastHeight=0;
    new ResizeObserver(()=>{
      const height=Math.ceil(panel.getBoundingClientRect().height);
      if(height===lastHeight)return;
      lastHeight=height;
      parent.postMessage({type:'edgelore-replay-size',height},location.origin);
    }).observe(panel);
  }
  Promise.all([fetch('./case-data.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}),continuation.load()]).then(([value])=>{data=value;data.sessions.forEach((s,session)=>{for(let i=0;i<s.turns.length;i++){if(s.turns[i].role==='user')rounds.push({session,user:s.turns[i],assistant:s.turns[i+1]?.role==='assistant'?s.turns[i+1]:null});}});$('send').disabled=false;$('replay').dataset.ready='true';$('play').disabled=false;$('reset').disabled=false;$('scrub').disabled=false;render();if(parent!==window)parent.postMessage({type:'edgelore-ready'},location.origin);}).catch(()=>{$('load-error').hidden=false;});
})();
