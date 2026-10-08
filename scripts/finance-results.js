// Small accessible charts for the authored finance examples.
window.FinanceDemoResults=(() => {
  const NS='http://www.w3.org/2000/svg', colors=['var(--chart-primary, #315b48)','var(--chart-secondary, #af735b)'];
  const total=values=>values.reduce((sum,v)=>sum+v,0);
  const number=(v,d=1)=>Number(v).toFixed(d);
  function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
  function svgEl(tag,attrs,text){const node=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));if(text!==undefined)node.textContent=text;return node;}
  function lineChart(labels,series,unit,title){
    const figure=el('figure','finance-line-figure'),caption=el('figcaption',null,title),legend=el('div','finance-chart-legend');
    figure.append(caption,legend);
    series.forEach((s,i)=>{const key=el('span',null,s.name);key.style.setProperty('--series-color',colors[i%colors.length]);legend.append(key);});
    const width=400,height=205,left=38,right=374,top=26,bottom=172;
    const values=series.flatMap(s=>s.values),rawMax=Math.max(...values,1),rawMin=Math.min(0,...values),step=Math.pow(10,Math.floor(Math.log10(rawMax)))/2;
    const max=Math.ceil(rawMax/step)*step,min=Math.floor(rawMin/step)*step,range=max-min||1;
    const x=i=>left+(right-left)*i/Math.max(1,labels.length-1),y=v=>bottom-(v-min)/range*(bottom-top);
    const chart=svgEl('svg',{viewBox:`0 0 ${width} ${height}`,role:'img','aria-label':`${title}，单位${unit}。${series.map(s=>`${s.name}：${s.values.map((v,i)=>`${labels[i]} ${v}`).join('，')}`).join('。')}`});
    chart.append(svgEl('text',{x:left,y:12,class:'finance-axis-unit'},unit));
    for(let i=0;i<=4;i++){const v=min+range*i/4,py=y(v);chart.append(svgEl('line',{x1:left,y1:py,x2:right,y2:py,class:'finance-chart-grid'}),svgEl('text',{x:left-7,y:py+3,'text-anchor':'end',class:'finance-axis-label'},number(v,Number.isInteger(v)?0:1)));}
    labels.forEach((label,i)=>chart.append(svgEl('text',{x:x(i),y:192,'text-anchor':'middle',class:'finance-axis-label'},label)));
    series.forEach((s,j)=>{
      chart.append(svgEl('path',{d:s.values.map((v,i)=>`${i?'L':'M'} ${x(i)} ${y(v)}`).join(' '),class:'finance-result-line',pathLength:'1',style:`--series-delay:${j*120}ms`,fill:'none',stroke:colors[j%colors.length],'stroke-width':2.5,'stroke-linejoin':'round','stroke-linecap':'round'}));
      s.values.forEach((v,i)=>{const dot=svgEl('circle',{cx:x(i),cy:y(v),r:3.5,fill:colors[j%colors.length],stroke:'#faf8ef','stroke-width':1.5,tabindex:0,'aria-label':`${s.name}，${labels[i]}：${v}${unit}`});dot.append(svgEl('title',{},`${labels[i]} · ${s.name} ${v}${unit}`));chart.append(dot);});
    });
    figure.append(chart);
    const details=el('details','finance-chart-data'),summary=el('summary',null,'查看数值'),table=el('table'),thead=el('thead'),head=el('tr');head.append(el('th',null,'月份'));series.forEach(s=>head.append(el('th',null,`${s.name}（${unit}）`)));thead.append(head);table.append(thead);
    const body=el('tbody');labels.forEach((label,i)=>{const row=el('tr');row.append(el('th',null,label));series.forEach(s=>row.append(el('td',null,number(s.values[i]))));body.append(row);});table.append(body);details.append(summary,table);figure.append(details);return figure;
  }
  function metrics(items){const grid=el('div','finance-report-metrics');items.forEach(([label,value])=>{const cell=el('div');cell.append(el('span',null,label),el('strong',null,value));grid.append(cell);});return grid;}
  function render(c){
    const report=el('section','finance-report');report.setAttribute('aria-label','模拟分析结果');
    if(c.type==='health'){
      const growth=(c.revenue.at(-1)/c.revenue[0]-1)*100,drop=c.margins.at(-1)-c.margins[0];
      report.append(el('span','finance-report-kicker','分析报告 · 3 / 3 方法已完成'),el('h4',null,'澄川公司｜上半年财务观察'),el('p','finance-report-lead','收入在增长，利润率和现金回收正在承压。'));
      report.append(metrics([['收入增长',`+${number(growth)}%`],['6 月利润率',`${number(c.margins.at(-1))}%`],['6 月经营现金流',`${c.cash.at(-1)} 万`]]));
      const switcher=el('div','finance-chart-switcher');switcher.setAttribute('aria-label','选择分析图表');const chartHost=el('div','finance-report-chart');
      const charts=[['收入趋势',()=>lineChart(c.months,[{name:'收入',values:c.revenue}],'万元','收入趋势')],['盈利能力',()=>lineChart(c.months,[{name:'经营利润率',values:c.margins}],'%','经营利润率变化')],['现金流',()=>lineChart(c.months,[{name:'经营现金流',values:c.cash},{name:'应收账款',values:c.receivables}],'万元','现金流与应收余额')]];
      const select=i=>{switcher.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));chartHost.replaceChildren(charts[i][1]());};
      charts.forEach(([label],i)=>{const button=el('button',null,label);button.type='button';button.addEventListener('click',()=>select(i));switcher.append(button);});report.append(switcher,chartHost);select(0);
      const conclusions=el('ol','finance-report-findings');
      [ ['收入',`1—6 月合计 ${total(c.revenue)} 万元，6 月较 1 月增长 ${number(growth)}%。`],['盈利',`利润率下降 ${number(Math.abs(drop))} 个百分点。成本增速高于收入，需继续查看成本明细。`],['现金',`经营现金流仍为正，但降至 ${c.cash.at(-1)} 万元；应收余额从 ${c.receivables[0]} 万升至 ${c.receivables.at(-1)} 万，建议进一步核对账龄与回款。`] ].forEach(([label,text],i)=>{const li=el('li');li.append(el('strong',null,label),el('p',null,text),el('small',null,`依据：方法 ${i+1}`));conclusions.append(li);});report.append(conclusions);
      report.append(el('small','finance-report-footnote','虚构公司与示例数据 · 多方法串行为前端 mock。经营利润率 =（收入 − 经营成本）/ 收入。'));
    } else if(c.type==='cash'){
      report.append(el('span','finance-report-kicker','趋势分析'),el('h4',null,'现金仍在流入，但回收速度放缓。'),metrics([['6 月经营现金流',`${c.cash.at(-1)} 万`],['应收余额变化',`+${number((c.receivables.at(-1)/c.receivables[0]-1)*100,0)}%`]]));
      report.append(lineChart(c.months,[{name:'经营现金流',values:c.cash},{name:'应收账款',values:c.receivables}],'万元','上半年现金流与应收账款'));
      report.append(el('p',null,'现金流下降与应收增加同时出现，是值得追踪的信号。仅凭这两条曲线不能确定原因，下一步可以查看应收账龄和客户回款记录。'),el('small','finance-report-footnote','澄川公司为虚构公司 · 示例数据，万元'));
    } else if(c.type==='expenses'){
      const actual=total(c.actual),budget=total(c.budget);report.append(el('span','finance-report-kicker','预算对比'),el('h4',null,`第二季度超预算 ${number(actual-budget,0)} 万元。`),metrics([['实际支出',`${actual} 万`],['预算',`${budget} 万`],['超出比例',`${number((actual/budget-1)*100)}%`]]));
      const bars=el('div','finance-expense-bars');bars.setAttribute('aria-label','各类费用的预算与实际对比，单位万元');
      const max=Math.max(...c.actual,...c.budget);c.labels.forEach((label,i)=>{const row=el('div','finance-expense-row');row.append(el('strong',null,label));const tracks=el('div');[['预算',c.budget[i],'budget'],['实际',c.actual[i],'actual']].forEach(([name,value,kind])=>{const track=el('div',kind),bar=el('i'),barSlot=el('div','finance-bar-slot');barSlot.append(bar);bar.style.width=`${value/max*100}%`;track.append(el('span',null,name),barSlot,el('b',null,`${value} 万`));tracks.append(track);});row.append(tracks);bars.append(row);});report.append(bars,el('p',null,'营销费用超出 2 万元，是最大的超支项；人员和云服务各超出 1 万元，办公费用持平。'),el('small','finance-report-footnote','示例数据 · 预算与实际采用同一统计期间'));
    } else {
      report.append(el('span','finance-report-kicker','查询结果'),el('h4',null,`第一季度收入共 ${number(total(c.values))} 万元。`),el('p',null,`收入逐月增长，3 月比 1 月增加 ${number(c.values[2]-c.values[0])} 万元。`));
      const chart=el('div','finance-chat-chart');c.values.forEach((v,i)=>{const row=el('div'),bar=el('i');bar.style.setProperty('--bar',`${v/Math.max(...c.values)*100}%`);row.append(el('span',null,c.labels[i]),bar,el('b',null,number(v)));chart.append(row);});chart.append(el('small',null,'万元 · 示例数据'));report.append(chart);
    }
    return report;
  }
  return {render};
})();
