document.addEventListener('DOMContentLoaded', () => {
  // Already logged in → go to dashboard
  if (Auth.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const tabSignIn   = document.getElementById('tab-signin');
  const tabSignUp   = document.getElementById('tab-signup');
  const form        = document.getElementById('auth-form');
  const emailInput  = document.getElementById('input-email');
  const passInput   = document.getElementById('input-password');
  const submitBtn   = document.getElementById('btn-submit');
  const extraFields = document.getElementById('extra-fields');

  let mode = 'signin'; // 'signin' | 'signup' | 'confirm'

  // ─── Tab switching ──────────────────────────────────────────────────────────
  function setTab(newMode) {
    mode = newMode;
    const isSignin = mode === 'signin';

    tabSignIn.classList.toggle('text-primary', isSignin);
    tabSignIn.classList.toggle('border-b-2', isSignin);
    tabSignIn.classList.toggle('border-primary-container', isSignin);
    tabSignIn.classList.toggle('text-on-surface-variant', !isSignin);

    tabSignUp.classList.toggle('text-primary', !isSignin);
    tabSignUp.classList.toggle('border-b-2', !isSignin);
    tabSignUp.classList.toggle('border-primary-container', !isSignin);
    tabSignUp.classList.toggle('text-on-surface-variant', isSignin);

    emailInput.closest('.space-y-2').classList.remove('hidden');
    passInput.closest('.space-y-2').classList.remove('hidden');
    extraFields.innerHTML = '';

    if (isSignin) {
      submitBtn.innerHTML = 'Enter Arena <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
    } else {
      submitBtn.innerHTML = 'Create Account <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
      renderSignUpFields();
    }
  }

  function renderSignUpFields() {
    extraFields.innerHTML = `
      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest text-on-surface-variant font-bold ml-1">Username</label>
        <input id="input-username"
          class="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary-container rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/30 transition-all outline-none"
          placeholder="vortex_striker" type="text" minlength="3" maxlength="15" required/>
      </div>
      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest text-on-surface-variant font-bold ml-1">CPF</label>
        <input id="input-cpf"
          class="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary-container rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/30 transition-all outline-none"
          placeholder="000.000.000-00" type="text" required/>
      </div>
      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest text-on-surface-variant font-bold ml-1">Birth Date</label>
        <input id="input-borndate"
          class="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary-container rounded-lg py-4 px-5 text-on-surface placeholder:text-on-surface-variant/30 transition-all outline-none"
          type="date" required/>
      </div>
    `;
  }

  function renderConfirmStep() {
    mode = 'confirm';
    emailInput.closest('.space-y-2').classList.add('hidden');
    passInput.closest('.space-y-2').classList.add('hidden');
    extraFields.innerHTML = `
      <p class="text-on-surface-variant text-sm text-center leading-relaxed">
        Código de verificação enviado ao seu email.<br/>
        Válido por <strong class="text-primary">15 minutos</strong>.
      </p>
      <div class="space-y-2">
        <label class="text-xs uppercase tracking-widest text-on-surface-variant font-bold ml-1">Verification Code</label>
        <input id="input-code"
          class="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary-container rounded-lg py-4 px-5 text-on-surface text-center text-2xl tracking-[0.4em] transition-all outline-none"
          placeholder="000000" type="text" maxlength="6" inputmode="numeric" required/>
      </div>
    `;
    submitBtn.innerHTML = 'Confirm Account <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
  }

  tabSignIn.addEventListener('click', () => setTab('signin'));
  tabSignUp.addEventListener('click', () => setTab('signup'));

  // ─── Form submission ────────────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '...';

    try {
      if (mode === 'signin')       await handleSignIn();
      else if (mode === 'signup')  await handleSignUp();
      else if (mode === 'confirm') await handleConfirm();
    } catch (err) {
      showToast(err.message || 'Erro inesperado.', 'error');
      submitBtn.textContent = originalText;
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ─── Sign In ────────────────────────────────────────────────────────────────
  async function handleSignIn() {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email:    emailInput.value.trim(),
        password: passInput.value,
      }),
    });

    if (!res) return;

    if (!res.ok) {
      showToast('Credenciais inválidas. Tente novamente.', 'error');
      submitBtn.innerHTML = 'Enter Arena <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
      return;
    }

    const data = await res.json();
    Auth.setToken(data.token);

    // Decode JWT to extract available claims (sub = email by default in Spring)
    const claims = Auth.decodeToken();
    Auth.setUser({ username: data.username, email: emailInput.value.trim(), sub: claims?.sub });

    showToast('Login realizado!', 'success');
    window.location.href = 'dashboard.html';
  }

  // ─── Sign Up ────────────────────────────────────────────────────────────────
  async function handleSignUp() {
    const res = await apiFetch('/users/create', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('input-username')?.value.trim(),
        password: passInput.value,
        cpf:      document.getElementById('input-cpf')?.value.replace(/\D/g, ''),
        email:    emailInput.value.trim(),
        bornDate: document.getElementById('input-borndate')?.value,
      }),
    });

    if (!res) return;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.message || 'Erro ao criar conta. Verifique os dados.', 'error');
      submitBtn.innerHTML = 'Create Account <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
      return;
    }

    sessionStorage.setItem('jt_pending_email', emailInput.value.trim());
    showToast('Conta criada! Verifique seu email.', 'success');
    renderConfirmStep();
  }

  // ─── Confirm code ────────────────────────────────────────────────────────────
  async function handleConfirm() {
    const email = sessionStorage.getItem('jt_pending_email') || emailInput.value.trim();
    const code  = document.getElementById('input-code')?.value.trim();

    const res = await apiFetch('/users/confirm-code', {
      method: 'PATCH',
      body: JSON.stringify({ email, code }),
    });

    if (!res) return;

    if (!res.ok) {
      showToast('Código inválido ou expirado.', 'error');
      submitBtn.innerHTML = 'Confirm Account <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>';
      return;
    }

    sessionStorage.removeItem('jt_pending_email');
    showToast('Conta ativada! Faça login.', 'success');
    setTab('signin');
  }
});
