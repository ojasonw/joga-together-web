document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();

  const list = document.getElementById('sessions-list');
  if (!list) return;

  list.innerHTML = `
    <div class="flex items-center justify-center gap-3 py-6 text-on-surface-variant">
      <span class="material-symbols-outlined text-primary" style="animation: spin 1s linear infinite;">refresh</span>
      <span class="text-xs uppercase tracking-widest">Loading sessions...</span>
    </div>
  `;

  let res;
  try {
    res = await apiFetch('/scheduling/all');
  } catch {
    list.innerHTML = emptyState('Erro de conexão com o servidor.');
    return;
  }

  if (!res || !res.ok) {
    list.innerHTML = emptyState('Não foi possível carregar as sessões.');
    return;
  }

  const sessions = await res.json();

  if (!sessions.length) {
    list.innerHTML = emptyState('Nenhuma sessão agendada ainda.');
    return;
  }

  list.innerHTML = sessions.map(s => `
    <div class="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest/60
                hover:bg-surface-container-lowest transition-colors border border-outline-variant/10">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined text-primary" style="font-size:18px">event</span>
        </div>
        <div>
          <h4 class="text-sm font-bold text-on-surface">${escapeHtml(s.name)}</h4>
          <p class="text-[10px] text-on-surface-variant uppercase tracking-widest">
            ${formatDate(s.date)}${s.time ? ' · ' + s.time : ''}
          </p>
        </div>
      </div>
      <span class="text-[10px] font-bold uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/10">
        ${s.users?.length ?? 0} players
      </span>
    </div>
  `).join('');
});

function emptyState(msg) {
  return `<p class="text-center text-on-surface-variant text-xs uppercase tracking-widest py-6">${escapeHtml(msg)}</p>`;
}
