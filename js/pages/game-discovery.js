document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  await loadCatalog();
  initSearch();
});

// ─── Catalog ──────────────────────────────────────────────────────────────────

async function loadCatalog() {
  const tbody = document.getElementById('games-catalog-body');
  if (!tbody) return;

  tbody.innerHTML = loadingRow();

  let res;
  try {
    res = await apiFetch('/games/all');
  } catch {
    tbody.innerHTML = errorRow('Erro de conexão com o servidor.');
    return;
  }

  if (!res || !res.ok) {
    tbody.innerHTML = errorRow('Não foi possível carregar o catálogo.');
    return;
  }

  const games = await res.json();

  if (!games.length) {
    tbody.innerHTML = emptyRow();
    return;
  }

  tbody.innerHTML = games.map(game => `
    <tr class="hover:bg-surface-container-high/50 transition-colors group">
      <td class="px-8 py-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded bg-primary-container/20 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary" style="font-size:20px">sports_esports</span>
          </div>
          <div>
            <div class="font-bold text-on-surface">${escapeHtml(game.title)}</div>
            <div class="text-[10px] text-on-surface-variant uppercase tracking-wide">${escapeHtml(game.genre || '—')}</div>
          </div>
        </div>
      </td>
      <td class="px-8 py-6">
        <span class="px-3 py-1 bg-primary-container/20 text-primary text-[10px] font-bold uppercase rounded-full">
          ${escapeHtml(game.developer || '—')}
        </span>
      </td>
      <td class="px-8 py-6 font-bold text-on-surface text-sm">${formatDate(game.releaseDate)}</td>
      <td class="px-8 py-6 text-right">
        <button class="px-4 py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded hover:brightness-110 transition-all">
          View Rooms
        </button>
      </td>
    </tr>
  `).join('');
}

// ─── RAWG Search ──────────────────────────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('rawg-search-input');
  const btn = document.getElementById('rawg-search-btn');
  const closeBtn = document.getElementById('rawg-results-close');

  if (!input || !btn) return;

  btn.addEventListener('click', () => runSearch(input.value.trim()));

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch(input.value.trim());
  });

  closeBtn?.addEventListener('click', () => {
    document.getElementById('rawg-results-panel').classList.add('hidden');
  });
}

async function runSearch(query) {
  if (!query) return;

  const panel = document.getElementById('rawg-results-panel');
  const grid = document.getElementById('rawg-results-grid');
  const label = document.getElementById('rawg-results-label');
  const btn = document.getElementById('rawg-search-btn');

  panel.classList.remove('hidden');
  grid.innerHTML = `
    <div class="col-span-3 px-6 py-8 text-center text-on-surface-variant text-sm">
      Buscando no RAWG...
    </div>`;

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined text-sm">refresh</span> Buscando...';

  let res;
  try {
    res = await apiFetch(`/games/search?q=${encodeURIComponent(query)}`);
  } catch {
    grid.innerHTML = `<div class="col-span-3 px-6 py-8 text-center text-sm text-on-surface-variant">Erro de conexão.</div>`;
    resetSearchBtn();
    return;
  }

  resetSearchBtn();

  if (!res || !res.ok) {
    grid.innerHTML = `<div class="col-span-3 px-6 py-8 text-center text-sm text-on-surface-variant">Falha na busca.</div>`;
    return;
  }

  const results = await res.json();
  label.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`;

  if (!results.length) {
    grid.innerHTML = `<div class="col-span-3 px-6 py-8 text-center text-sm text-on-surface-variant">Nenhum jogo encontrado.</div>`;
    return;
  }

  grid.innerHTML = results.map(game => `
    <div class="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-high/40 transition-colors border-b border-outline-variant/5 last:border-0">
      <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
        ${game.imageUrl
          ? `<img src="${escapeHtml(game.imageUrl)}" alt="${escapeHtml(game.name)}" class="w-full h-full object-cover"/>`
          : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-primary-container">sports_esports</span></div>`
        }
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-on-surface text-sm truncate">${escapeHtml(game.name)}</div>
        <div class="text-[10px] text-on-surface-variant uppercase tracking-wide">${escapeHtml(game.genres?.join(' • ') || '—')}</div>
        <div class="text-[10px] text-on-surface-variant/60 mt-0.5">${formatDate(game.released)}</div>
      </div>
      <button
        class="rawg-import-btn flex-shrink-0 p-2 bg-surface-container-high text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary hover:text-on-primary transition-all"
        data-rawg-id="${game.rawgId}"
        data-name="${escapeHtml(game.name)}"
        title="Importar para o catálogo">
        <span class="material-symbols-outlined" style="font-size:18px">download</span>
      </button>
    </div>
  `).join('');

  grid.querySelectorAll('.rawg-import-btn').forEach(btn => {
    btn.addEventListener('click', () => importGame(btn));
  });
}

async function importGame(btn) {
  const rawgId = btn.dataset.rawgId;
  const name = btn.dataset.name;

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">refresh</span>';

  let res;
  try {
    res = await apiFetch(`/games/import?rawgId=${rawgId}`, { method: 'POST' });
  } catch {
    showToast('Erro ao importar jogo.', 'error');
    resetImportBtn(btn);
    return;
  }

  if (res?.status === 201 || res?.ok) {
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">check</span>';
    btn.classList.add('bg-primary', 'text-on-primary');
    showToast(`"${name}" adicionado ao catálogo!`, 'success');
    await loadCatalog();
  } else {
    showToast('Falha ao importar jogo.', 'error');
    resetImportBtn(btn);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetSearchBtn() {
  const btn = document.getElementById('rawg-search-btn');
  btn.disabled = false;
  btn.innerHTML = '<span class="material-symbols-outlined text-sm">travel_explore</span> Buscar';
}

function resetImportBtn(btn) {
  btn.disabled = false;
  btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">download</span>';
}

function loadingRow() {
  return `
    <tr>
      <td colspan="4" class="px-8 py-12 text-center text-on-surface-variant">
        <p class="text-xs uppercase tracking-widest">Carregando catálogo...</p>
      </td>
    </tr>`;
}

function emptyRow() {
  return `
    <tr>
      <td colspan="4" class="px-8 py-12 text-center">
        <span class="material-symbols-outlined text-primary-container/40 text-5xl block mb-3">sports_esports</span>
        <p class="text-on-surface-variant text-sm">Nenhum jogo no catálogo ainda.</p>
        <p class="text-on-surface-variant/50 text-xs mt-1">Use a busca acima para encontrar e importar jogos do RAWG.</p>
      </td>
    </tr>`;
}

function errorRow(msg) {
  return `
    <tr>
      <td colspan="4" class="px-8 py-10 text-center text-on-surface-variant text-sm">
        ${escapeHtml(msg)}
      </td>
    </tr>`;
}
