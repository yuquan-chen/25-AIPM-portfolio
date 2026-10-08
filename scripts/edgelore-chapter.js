/* Illustrative UI only. No live Edgelore runtime or user memory is accessed. */
(() => {
  const root = document.getElementById('edgelore-demo');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-memory-step]')];
  const states = [
    { status:'已采纳', old:'accepted', oldLabel:'已采纳', next:null,
      title:'一条记忆，有据可查。',
      body:'用户给出项目负责人的信息。在这个单值属性上尚无矛盾，系统采纳这条声明，同时记录它来自哪段对话。',
      recall:'项目负责人：Alice。可以沿来源回到第一段原始记录。' },
    { status:'存在冲突', old:'accepted', oldLabel:'已采纳', next:'tentative', nextLabel:'待确认',
      title:'新的说法，先保留分歧。',
      body:'第二段记录给出了不同的负责人。旧声明仍被采纳，新声明进入待确认状态；“负责人”这个属性被标记为冲突，两个来源都留下来。',
      recall:'已有记录：Alice；新说法：Bob，待确认。召回同时提供冲突状态与来源。' },
    { status:'冲突已裁决', old:'superseded', oldLabel:'已被替代', next:'accepted', nextLabel:'已采纳',
      title:'确认变更，也留下来路。',
      body:'在这个例子里，用户确认由 Bob 接手。新声明被采纳，旧声明标记为已被替代，并留下裁决者和替代关系。历史仍然可以追溯。',
      recall:'当前负责人：Bob。Alice 的旧记录保留；本次变更由用户确认。' }
  ];
  const records = root.querySelector('.memory-records');
  const record = (id, quote, state, label, source) => `<article class="memory-record" data-state="${state}"><div class="memory-record-top"><span>${id}</span><b>${label} / ${state}</b></div><p>${quote}</p><small>${source}</small></article>`;
  function render(index) {
    const state = states[index];
    steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    records.innerHTML = `<p class="memory-slot"><span>项目 A / 负责人 · 单值属性</span><span>${state.status}</span></p>` +
      record('记录 01', '“项目 A 由 Alice 负责。”', state.old, state.oldLabel, '来源：对话片段 01 · 用户陈述') +
      (state.next ? record('记录 02', '“项目 A 现在由 Bob 负责。”', state.next, state.nextLabel, '来源：对话片段 02 · 用户陈述') : '<div class="memory-empty">这时，只有一条关于负责人的记录。</div>');
    root.querySelector('#memory-story-title').textContent = state.title;
    root.querySelector('#memory-story-body').textContent = state.body;
    root.querySelector('#memory-recall-copy').textContent = state.recall;
  }
  steps.forEach((button, i) => button.addEventListener('click', () => render(i)));
  render(1);
})();
