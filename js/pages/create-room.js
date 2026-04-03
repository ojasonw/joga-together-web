document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const btn     = document.getElementById('btn-launch-room');
  const nameIn  = document.getElementById('input-room-name');
  const descIn  = document.getElementById('input-room-description');

  if (!btn) return;

  btn.addEventListener('click', async () => {
    const user = Auth.getUser();

    // masterId: backend expects UUID of the user.
    // Currently the login endpoint doesn't return the user UUID.
    // When the backend exposes GET /users/me, store it in Auth.setUser().
    // For now we pass the JWT subject (email) as fallback — update when UUID is available.
    const masterId = user?.id || user?.sub;

    if (!masterId) {
      showToast('Não foi possível identificar o usuário. Faça login novamente.', 'error');
      Auth.logout();
      return;
    }

    const name = nameIn?.value.trim() || `Room ${new Date().toLocaleDateString('pt-BR')}`;
    const description = descIn?.value.trim() || '';

    btn.disabled = true;
    btn.textContent = 'Creating...';

    let res;
    try {
      res = await apiFetch('/groups/create', {
        method: 'POST',
        body: JSON.stringify({ name, description, masterId }),
      });
    } catch {
      showToast('Erro de conexão com o servidor.', 'error');
      btn.disabled = false;
      btn.textContent = 'Launch Room';
      return;
    }

    btn.disabled = false;
    btn.textContent = 'Launch Room';

    if (!res || !res.ok) {
      showToast('Erro ao criar sala. Tente novamente.', 'error');
      return;
    }

    const groupId = await res.text();
    showToast('Sala criada com sucesso!', 'success');
    setTimeout(() => window.location.href = `/room-details?id=${groupId}`, 1200);
  });
});
