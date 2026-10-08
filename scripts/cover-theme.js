/* Appearance controls belong to the cover only; the portfolio stays night/pixel. */
(() => {
  'use strict';
  const cover = document.querySelector('.cover');
  if (!cover) return;

  const modeButtons = [...document.querySelectorAll('[data-cover-mode-choice]')];
  const styleButtons = [...document.querySelectorAll('[data-cover-style-choice]')];
  const nav = document.querySelector('.cover-nav');
  const index = document.querySelector('.contents-sheet');
  const clock = document.getElementById('cover-local-time');
  const label = document.getElementById('cover-light-label');
  const marker = document.getElementById('cover-time-marker');
  const storage = {
    get(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  let selectedMode = storage.get('cover-mode', 'auto');
  let selectedStyle = storage.get('cover-style', 'pixel');
  if (!['auto', 'day', 'night'].includes(selectedMode)) selectedMode = 'auto';
  if (!['paper', 'pixel'].includes(selectedStyle)) selectedStyle = 'pixel';

  const mix = (a, b, t) => a.map((value, i) => value + (b[i] - value) * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const stops = [
    { hour: 6, position: [-6, 2, -3], color: [1, .83, .66], power: 1.35, ambient: .28, paper: [238, 237, 229] },
    { hour: 9, position: [-4.5, 5, -2], color: [1, .97, .89], power: 1.55, ambient: .32, paper: [236, 240, 234] },
    { hour: 12, position: [0, 8, -1], color: [.96, 1, 1], power: 1.65, ambient: .36, paper: [237, 241, 236] },
    { hour: 15, position: [4.5, 5, -2], color: [1, .93, .80], power: 1.52, ambient: .30, paper: [237, 240, 233] },
    { hour: 18, position: [6, 2, -3], color: [1, .75, .56], power: 1.32, ambient: .25, paper: [236, 234, 227] }
  ];
  function sample(hour) {
    if (hour >= 18 || hour < 6) {
      const nightHour = hour < 6 ? hour + 24 : hour;
      const depth = Math.sin((nightHour - 18) / 12 * Math.PI);
      return { direction: [-1, .65, .40], color: [1, .83, .64], power: lerp(1.30, 1.08, depth), ambient: lerp(.25, .21, depth), paper: mix([20, 32, 28], [14, 24, 22], depth), dark: true };
    }
    let index = 0;
    while (index < stops.length - 2 && hour >= stops[index + 1].hour) index++;
    const a = stops[index], b = stops[index + 1], t = (hour - a.hour) / (b.hour - a.hour);
    const dayProgress = Math.max(0, Math.min(1, (hour - 6) / 12));
    return {
      color: mix(a.color, b.color, t),
      power: lerp(a.power, b.power, t),
      ambient: lerp(a.ambient, b.ambient, t),
      paper: mix(a.paper, b.paper, t),
      direction: [-1, .20 + Math.sin(dayProgress * Math.PI) * .45, Math.sin((dayProgress - .5) * Math.PI) * .50],
      dark: false
    };
  }
  function updatePressed(buttons, attribute, selected) {
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset[attribute] === selected));
  }
  function paint() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const sampleHour = selectedMode === 'day' ? 12 : selectedMode === 'night' ? 20 : hour;
    const light = sample(sampleHour);
    const mode = light.dark ? 'night' : 'day';
    cover.dataset.coverMode = mode;
    cover.dataset.coverStyle = selectedStyle;
    updatePressed(modeButtons, 'coverModeChoice', selectedMode);
    updatePressed(styleButtons, 'coverStyleChoice', selectedStyle);
    if (clock) {
      clock.dateTime = now.toISOString();
      clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    if (label) label.textContent = selectedMode === 'auto' ? (mode === 'night' ? '实时 · 夜间' : '实时 · 日间') : (mode === 'night' ? '夜间预览' : '日间预览');
    if (marker) marker.parentElement.style.setProperty('--cover-time-progress', `${hour / 24 * 100}%`);
    window.coverLighting = light;
    window.dispatchEvent(new Event('coverlightchange'));
  }
  function updateStyleControlVisibility() {
    if (!nav || !index) return;
    nav.classList.toggle('cover-style-visible', index.getBoundingClientRect().top > nav.getBoundingClientRect().bottom + 4);
  }
  for (const button of modeButtons) button.addEventListener('click', () => {
    selectedMode = button.dataset.coverModeChoice;
    storage.set('cover-mode', selectedMode);
    paint();
  });
  for (const button of styleButtons) button.addEventListener('click', () => {
    selectedStyle = button.dataset.coverStyleChoice;
    storage.set('cover-style', selectedStyle);
    paint();
  });
  window.addEventListener('scroll', updateStyleControlVisibility, { passive: true });
  window.addEventListener('resize', updateStyleControlVisibility);
  updateStyleControlVisibility();
  paint();
  setInterval(() => { if (!document.hidden && selectedMode === 'auto') paint(); else if (!document.hidden) {
    const now = new Date();
    if (clock) { clock.dateTime = now.toISOString(); clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; }
    if (marker) marker.parentElement.style.setProperty('--cover-time-progress', `${(now.getHours() + now.getMinutes() / 60) / 24 * 100}%`);
  } }, 60_000);
})();
