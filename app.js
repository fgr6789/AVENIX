(() => {
  const tiles = [...document.querySelectorAll('.tile')];
  const toast = document.getElementById('toast');
  let selected = 0;
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function select(index) {
    selected = (index + tiles.length) % tiles.length;
    tiles.forEach((tile, i) => tile.classList.toggle('selected', i === selected));
    tiles[selected].focus({preventScroll:true});
  }
  function activate(tile) {
    const url = tile.dataset.url;
    const action = tile.dataset.action;
    if (url) {
      // TV browsers may open the service in the same tab.
      window.location.href = url;
    } else if (action === 'games') {
      notify('Раздел «Игры» появится в следующем обновлении AVENIX.');
    } else if (action === 'assistant') {
      notify('Помощник AVENIX пока готовится к запуску.');
    }
  }
  tiles.forEach((tile, i) => {
    tile.addEventListener('focus', () => { selected = i; tiles.forEach((t,j)=>t.classList.toggle('selected',j===i)); });
    tile.addEventListener('click', () => activate(tile));
  });
  document.addEventListener('keydown', event => {
    const key = event.key;
    if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Enter',' '].includes(key)) event.preventDefault();
    if (key === 'ArrowRight') select(selected + 1);
    if (key === 'ArrowLeft') select(selected - 1);
    if (key === 'ArrowDown') select(selected + 2);
    if (key === 'ArrowUp') select(selected - 2);
    if (key === 'Enter' || key === ' ') activate(tiles[selected]);
  });
  select(0);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();