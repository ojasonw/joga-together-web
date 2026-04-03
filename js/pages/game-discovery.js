document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  const tbody = document.getElementById('games-catalog-body');
  if (!tbody) return;

  // Loading state
  tbody.innerHTML = `
    <tr>
      <td colspan="4" class="px-8 py-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-primary text-2xl" style="animation: spin 1s linear infinite;">refresh</span>
        <p class="mt-2 text-xs uppercase tracking-widest">Loading catalog...</p>
      </td>
    </tr>
  `;

  let res;
  try {
    res = await apiFetch('/games/all');
  } catch {
    tbody.innerHTML = errorRow('Erro de conexão com o servidor.');
    return;
  }

  if (!res || !res.ok) {
    tbody.innerHTML = errorRow('Não foi possível carregar o catálogo de jogos.');
    return;
  }

  const games = await res.json();

  if (!games.length) {
    tbody.innerHTML = errorRow('Nenhum jogo cadastrado ainda.');
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
});

function errorRow(msg) {
  return `
    <tr>
      <td colspan="4" class="px-8 py-10 text-center text-on-surface-variant text-sm">
        ${escapeHtml(msg)}
      </td>
    </tr>
  `;
}
