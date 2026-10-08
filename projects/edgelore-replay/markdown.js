// Render cached prose as Markdown while leaving the stored source unchanged.
(() => {
  const cache = new Map();
  window.renderReplayMarkdown = value => {
    const source = String(value ?? '');
    if (cache.has(source)) return cache.get(source);
    const html = marked.parse(source, { gfm: true, breaks: false, async: false });
    const fragment = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'del', 's', 'u', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'hr',
        'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub'],
      ALLOWED_ATTR: ['href', 'title', 'start', 'align'],
      RETURN_DOM_FRAGMENT: true
    });
    fragment.querySelectorAll('a[href]').forEach(link => {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
    fragment.querySelectorAll('table').forEach(table => {
      const scroller = document.createElement('div');
      scroller.className = 'markdown-table';
      scroller.tabIndex = 0;
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', '原文表格，可横向滚动');
      table.replaceWith(scroller);
      scroller.append(table);
    });
    const container = document.createElement('div');
    container.append(fragment);
    const result = container.innerHTML;
    cache.set(source, result);
    return result;
  };
})();
