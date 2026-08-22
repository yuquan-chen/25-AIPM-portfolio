// 检查嵌入模式
const params = new URLSearchParams(window.location.search);
const embedMode = params.get('embed') === '1';

if (embedMode) {
  document.body.classList.add('embed-mode');
}

// DOM 元素
const indexCards = document.getElementById('index-cards');
const noteDetail = document.getElementById('note-detail');
const noteContent = document.getElementById('note-content');
const backBtn = document.getElementById('back-btn');

function reportHeight() {
  if (!embedMode || window.parent === window) return;
  window.parent.postMessage({
    source: 'llm-learning',
    type: 'demo:resize',
    payload: { height: Math.ceil(document.documentElement.scrollHeight) }
  }, window.location.origin);
}

// 点击卡片
indexCards.addEventListener('click', (e) => {
  const card = e.target.closest('.index-card');
  if (!card) return;

  const noteKey = card.dataset.note;
  const note = NOTES[noteKey];
  if (!note) return;

  // 渲染笔记
  noteContent.innerHTML = `
    <h1>${note.title}</h1>
    ${note.content}
  `;

  // 切换显示
  indexCards.style.display = 'none';
  noteDetail.classList.add('active');
  requestAnimationFrame(reportHeight);

  // 发送消息
  if (embedMode && window.parent !== window) {
    window.parent.postMessage({
      source: 'llm-learning',
      type: 'note:selected',
      payload: { noteId: noteKey, title: note.title }
    }, window.location.origin);
  }
});

// 返回按钮
backBtn.addEventListener('click', () => {
  noteDetail.classList.remove('active');
  indexCards.style.display = 'grid';
  requestAnimationFrame(reportHeight);
});

// 键盘支持
indexCards.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.target.closest('.index-card')?.click();
  }
});

// 发送就绪消息
if (embedMode && window.parent !== window) {
  window.parent.postMessage({
    source: 'llm-learning',
    type: 'demo:ready'
  }, window.location.origin);

  window.addEventListener('load', reportHeight);
  window.addEventListener('resize', reportHeight);
  if ('ResizeObserver' in window) {
    new ResizeObserver(reportHeight).observe(document.body);
  }
}
