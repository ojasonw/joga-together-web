// ─── Configuration ────────────────────────────────────────────────────────────
// Override window.API_BASE_URL before this script loads for different envs.
const API_BASE_URL = window.API_BASE_URL || '/api';

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const Auth = {
  getToken()  { return localStorage.getItem('jt_token'); },
  setToken(t) { localStorage.setItem('jt_token', t); },
  clearToken(){ localStorage.removeItem('jt_token'); },
  isAuthenticated() { return !!this.getToken(); },

  setUser(u)  { localStorage.setItem('jt_user', JSON.stringify(u)); },
  getUser() {
    try { return JSON.parse(localStorage.getItem('jt_user')); }
    catch { return null; }
  },

  // Decodes JWT payload to extract claims (sub, exp, custom fields)
  decodeToken() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
  },

  logout() {
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
    window.location.href = '/login';
  },
};

// ─── HTTP client ──────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (err) {
    console.error('[API] Network error:', err);
    throw new Error('Erro de conexão com o servidor.');
  }

  if (res.status === 401) {
    Auth.logout();
    return null;
  }

  return res;
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
function requireAuth() {
  if (!Auth.isAuthenticated()) {
    window.location.href = '/login';
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const colors = {
    success: 'bg-primary-container text-on-primary-container',
    error:   'bg-error-container text-on-error-container',
    info:    'bg-surface-container-high text-on-surface',
  };

  const toast = document.createElement('div');
  toast.className = [
    'fixed bottom-6 right-6 z-[9999]',
    'px-6 py-4 rounded-xl shadow-2xl',
    'font-bold text-sm uppercase tracking-widest',
    'transition-all duration-300 opacity-100',
    colors[type] || colors.info,
  ].join(' ');
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch { return String(dateStr); }
}
