(() => {
  const toast = document.getElementById('toast');
  const views = {home: document.getElementById('homeView'), games: document.getElementById('gamesView')};
  const navButtons = [...document.querySelectorAll('[data-view]')];
  const gameCards = [...document.querySelectorAll('.game-card')];
  const categoryButtons = [...document.querySelectorAll('.category')];
  const search = document.getElementById('gameSearch');
  const gameGrid = document.getElementById('gameGrid');
  const noGames = document.getElementById('noGames');
  const gameCount = document.getElementById('gameCount');
  let currentView = 'home';
  let activeCategory = 'all';
  let focusIndex = 0;
  let toastTimer;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function showView(name) {
    currentView = name;
    Object.entries(views).forEach(([key, el]) => el.classList.toggle('hidden', key !== name));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === name));
    focusIndex = 0;
    const first = name === 'games' ? document.querySelector('.category.active') : document.querySelector('#tiles .tile');
    if (first) first.focus({preventScroll:true});
    window.scrollTo(0, 0);
  }
  function filterGames() {
    const query = (search.value || '').trim().toLowerCase();
    let visible = 0;
    gameCards.forEach(card => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matchesText = !query || (card.dataset.search + ' ' + card.innerText).toLowerCase().includes(query);
      const show = matchesCategory && matchesText;
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    gameCount.textContent = visible;
    noGames.classList.toggle('hidden', visible !== 0);
  }
  function activate(element) {
    if (!element) return;
    if (element.dataset.view) { showView(element.dataset.view); return; }
    if (element.dataset.category) {
      activeCategory = element.dataset.category;
      categoryButtons.forEach(btn => btn.classList.toggle('active', btn === element));
      filterGames();
      return;
    }
    if (element.dataset.url) {
      window.location.href = element.dataset.url;
      return;
    }
    if (element.dataset.action === 'assistant') notify('Помощник AVENIX пока готовится к запуску.');
  }

  document.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  document.querySelectorAll('.tile, .game-card, .category, .back-home').forEach(el => {
    el.addEventListener('click', () => activate(el));
    el.addEventListener('focus', () => { document.querySelectorAll('.selected').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); });
  });
  categoryButtons.forEach(btn => btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    categoryButtons.forEach(x => x.classList.toggle('active', x === btn));
    filterGames();
  }));
  search.addEventListener('input', filterGames);

  function focusables() {
    if (currentView === 'home') return [...document.querySelectorAll('#tiles .tile')];
    return [
      ...categoryButtons,
      ...gameCards.filter(card => !card.classList.contains('hidden')),
      document.querySelector('.back-home')
    ].filter(Boolean);
  }
  document.addEventListener('keydown', event => {
    const key = event.key;
    if (currentView === 'games' && document.activeElement === search && !['Escape'].includes(key)) return;
    if (key === 'Escape' || key === 'Backspace') {
      if (currentView === 'games') { event.preventDefault(); showView('home'); }
      return;
    }
    if (!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Enter',' '].includes(key)) return;
    event.preventDefault();
    const items = focusables();
    if (!items.length) return;
    let index = items.indexOf(document.activeElement);
    if (index < 0) index = 0;
    if (key === 'Enter' || key === ' ') { activate(items[index]); return; }
    const cols = currentView === 'home' ? 2 : 4;
    if (key === 'ArrowRight') index = Math.min(items.length - 1, index + 1);
    if (key === 'ArrowLeft') index = Math.max(0, index - 1);
    if (key === 'ArrowDown') index = Math.min(items.length - 1, index + cols);
    if (key === 'ArrowUp') index = Math.max(0, index - cols);
    items[index].focus({preventScroll:true});
    items[index].scrollIntoView({block:'nearest', inline:'nearest'});
  });

  filterGames();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  const firstTile = document.querySelector('#tiles .tile');
  if (firstTile) firstTile.focus({preventScroll:true});
})();