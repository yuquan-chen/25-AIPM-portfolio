'use strict';

// Motion follows explicit input. Nothing on the page plays in a loop.
const papers = Array.from(document.querySelectorAll('.paper'));
const stack = document.querySelector('#paper-stack');
let front = 0;
document.querySelector('#next-paper').addEventListener('click', () => {
  front = (front + 1) % papers.length;
  stack.classList.remove('is-turning');
  papers.forEach((paper, index) => {
    const position = (index - front + papers.length) % papers.length;
    paper.dataset.position = ['front', 'middle', 'back'][position];
    paper.inert = position !== 0;
    if (position === 0) paper.removeAttribute('aria-hidden');
    else paper.setAttribute('aria-hidden', 'true');
  });
  document.querySelector('#paper-count').textContent = `0${front + 1} / 03`;
  // Restart the short settling motion, including on repeated clicks.
  void stack.offsetWidth;
  stack.classList.add('is-turning');
});

const queryStates = [
  {caption: '从问题开始', copy: '先明确时间范围和费用口径，再提出查询方案。', button: '查看查询方案 →'},
  {caption: '方案已检查', copy: '拟读取：上个月的费用明细。查询通过只读 API 执行，范围需要你确认。', button: '查看待确认内容 →'},
  {caption: '等你确认', copy: '只读取上个月的费用明细，不修改任何记录。点击确认，才进入执行步骤。', button: '确认本次读取 →'},
  {caption: '结果与记录一起返回', copy: '示意流程完成：返回查询结果，留下审计记录，销毁执行沙箱并清理临时数据。', button: '再走一遍 ↺'}
];
let queryStep = 0;
const queryNext = document.querySelector('#query-next');
const queryReset = document.querySelector('#query-reset');
function renderQuery() {
  const state = queryStates[queryStep];
  document.querySelector('#query-caption').textContent = state.caption;
  document.querySelector('#query-copy').textContent = state.copy;
  queryNext.textContent = state.button;
  queryReset.hidden = queryStep === 0 || queryStep === 3;
  document.querySelectorAll('.query-path li').forEach((item, index) => {
    item.classList.toggle('current', index === queryStep);
    item.classList.toggle('done', index < queryStep);
    if (index === queryStep) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
}
queryNext.addEventListener('click', () => { queryStep = (queryStep + 1) % queryStates.length; renderQuery(); });
queryReset.addEventListener('click', () => { queryStep = 0; renderQuery(); queryNext.focus(); });
renderQuery();

let slowed = false;
document.querySelector('#edit-toggle').addEventListener('click', (event) => {
  slowed = !slowed;
  document.querySelector('#editing-demo').classList.toggle('is-slow', slowed);
  document.querySelector('#ending-duration').textContent = slowed ? '8s' : '4s';
  document.querySelector('#clip-duration').textContent = slowed ? '00:16' : '00:12';
  document.querySelector('#timeline-version').textContent = slowed ? '修改后 · 16 秒' : '初版 · 12 秒';
  document.querySelector('#edit-feedback').textContent = slowed ? '结尾从 4 秒延长到 8 秒，前两个镜头保持原时长。' : '给结尾多留一点时间？';
  event.currentTarget.textContent = slowed ? '撤销这次修改 ↶' : '试试“结尾慢一点” ↗';
  event.currentTarget.setAttribute('aria-pressed', String(slowed));
});
