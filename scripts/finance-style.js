// All portfolio demos use one permanent skin: pixel visuals in the night palette.
(() => {
  const root=document.documentElement;
  root.dataset.financeStyle='pixel';
  root.dataset.lightMode='night';
  root.style.colorScheme='dark';
})();
