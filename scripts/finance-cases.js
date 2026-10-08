// Authored demonstration data. No live company records or backend execution.
(() => {
  const months=['1月','2月','3月','4月','5月','6月'];
  const revenue=[120,128,126,141,149,160], cost=[90,96,98,109,117,131];
  const cash=[18,21,16,13,8,4], receivables=[40,43,49,56,63,74];
  const margins=revenue.map((v,i)=>Math.round((v-cost[i])/v*1000)/10);
  window.FinanceDemoCases={
    query:{label:'月度收入',question:'今年第一季度，每个月的收入是多少？',scope:'汇总 2026 年 1—3 月收入，只读取月份和收入金额。',method:'按月汇总收入',sql:"SELECT month, SUM(revenue) AS revenue\nFROM demo_revenue\nWHERE month BETWEEN '2026-01' AND '2026-03'\nGROUP BY month ORDER BY month;",type:'revenue',labels:['1月','2月','3月'],values:[12.4,13.8,15.2]},
    expenses:{label:'费用对比',question:'第二季度，哪些费用超过了预算？',scope:'比较第二季度四类费用的预算与实际支出。',method:'对比费用与预算',sql:"SELECT category, budget, actual, actual - budget AS variance\nFROM demo_expenses\nWHERE quarter = '2026-Q2';",type:'expenses',labels:['人员','云服务','办公','营销'],budget:[23,8,6,9],actual:[24,9,6,11]},
    cash:{label:'现金流趋势',question:'帮我看看澄川公司上半年现金流的变化，回款有没有压力？',scope:'读取 1—6 月经营现金流与期末应收账款，观察变化。',method:'对比现金流与应收趋势',sql:"SELECT month, operating_cash_flow, receivables\nFROM demo_monthly_finance\nWHERE month BETWEEN '2026-01' AND '2026-06'\nORDER BY month;",type:'cash',months,cash,receivables},
    health:{label:'财务健康 · 3 方法',question:'分析一下澄川公司上半年的财务健康状况，给我一份简短报告。',scope:'分析收入、盈利能力与现金流，三个方法按顺序运行后汇总。',type:'health',months,revenue,cost,margins,cash,receivables,
      methods:[
        {name:'收入趋势',operation:'按月聚合收入，计算增长',sql:'SELECT month, SUM(revenue) AS revenue FROM demo_monthly_finance GROUP BY month ORDER BY month;',finding:'收入从 120 万增至 160 万，增长 33.3%。'},
        {name:'盈利能力',operation:'计算利润和经营利润率',sql:'SELECT month, revenue - operating_cost AS profit, (revenue - operating_cost) / revenue AS margin FROM demo_monthly_finance ORDER BY month;',finding:'经营利润率从 25.0% 降至 18.1%，下降 6.9 个百分点。'},
        {name:'现金流与回款',operation:'对比经营现金流和应收余额',sql:'SELECT month, operating_cash_flow, receivables FROM demo_monthly_finance ORDER BY month;',finding:'经营现金流从 18 万降至 4 万，应收余额升至 74 万。'}
      ]},
    repair:{label:'校验后修复',question:'今年第一季度，每个月的收入是多少？',scope:'修复字段错误后，重新校验并汇总第一季度收入。',method:'按月汇总收入',type:'revenue',labels:['1月','2月','3月'],values:[12.4,13.8,15.2]},
    direct:{label:'直接回答',question:'你能帮我做哪些财务分析？',type:'direct'}
  };
})();
