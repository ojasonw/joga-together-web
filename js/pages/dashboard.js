document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  // Populate username in sidebar/header wherever [data-username] exists
  const user = Auth.getUser();
  if (user) {
    const name = user.username || user.email || 'Joga Player';
    document.querySelectorAll('[data-username]').forEach(el => {
      el.textContent = name;
    });
  }
});
