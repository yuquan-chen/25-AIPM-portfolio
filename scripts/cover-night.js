/* Project chapters stay fixed to night/pixel; cover-theme.js controls the cover. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.dataset.lightMode = 'night';
  root.dataset.financeStyle = 'pixel';
  root.style.colorScheme = 'dark';

  const light = {
    position: [-3.8, 3.4, -2],
    direction: [-1, .65, .40],
    color: [1, .83, .64],
    power: 1.19,
    ambient: .23,
    paper: [17, 28, 25],
    dark: true
  };
  const rgb = values => `rgb(${values.map(Math.round).join(',')})`;
  root.style.setProperty('--paper', rgb(light.paper));
  root.style.setProperty('--sheet', rgb(light.paper.map(value => value + 5)));
  root.style.setProperty('--light-x', '31%');
  root.style.setProperty('--light-wash', 'rgba(194,153,105,.12)');
  root.style.setProperty('--beam-angle', '131deg');
  root.style.setProperty('--beam-color', 'rgba(221,174,111,.075)');
  root.style.setProperty('--shade-color', 'rgba(0,0,0,.25)');
  root.style.setProperty('--shadow-shift', '49px');
  root.style.setProperty('--shadow-stretch', '1.35');
  root.style.setProperty('--shadow-alpha', '.65');
  window.coverLighting = light;
  window.dispatchEvent(new Event('coverlightchange'));
})();
