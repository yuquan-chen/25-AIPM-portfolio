(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const frame = document.getElementById('companionDemo');
    if (!frame) return;

    const syncStyle = () => {
      frame.contentWindow?.postMessage({
        source: 'portfolio',
        type: 'finance-style-change',
        style: document.documentElement.dataset.financeStyle === 'pixel' ? 'pixel' : 'paper'
      }, location.origin);
    };

    frame.addEventListener('load', syncStyle);
    window.addEventListener('portfolio:style-change', syncStyle);
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
      if (event.data?.source === 'companion-agent' && event.data.type === 'demo:ready') syncStyle();
    });
  });
})();
