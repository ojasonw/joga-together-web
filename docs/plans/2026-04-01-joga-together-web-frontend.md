# Joga Together Web — Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Estruturar o frontend do Joga Together com separação clara de HTML, CSS e JS, a partir dos mockups do Stitch (Tailwind CDN), gerando uma imagem Docker nginx pronta para deploy no k3s.

**Architecture:** Site estático multi-página servido por nginx. CSS global extraído para `css/style.css`, Tailwind config compartilhada em `js/tailwind.config.js`, interações globais em `js/main.js` e JS específico por página em `js/pages/`. Dockerfile idêntico ao web-page de referência (nginx:1.27-alpine, sem build step Node).

**Tech Stack:** HTML5, Tailwind CSS (Play CDN v3), vanilla JS, nginx:1.27-alpine, Docker

**Stitch source:** `/home/jason/Downloads/stitch (1)/stitch/`
**Reference repo:** `/home/jason/my-projects/github-ojasonw/personal/web-page/`
**Target repo:** `/home/jason/my-projects/github-ojasonw/joga-together/joga-together-web/`

---

## Estrutura final esperada

```
joga-together-web/
├── Dockerfile
├── nginx.conf
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── plans/
│   │   └── 2026-04-01-joga-together-web-frontend.md
│   └── DESIGN-SYSTEM.md
├── index.html
├── login.html
├── dashboard.html
├── browse-rooms.html
├── create-room.html
├── game-discovery.html
├── notifications.html
├── profile.html
├── room-details.html
├── schedule.html
├── 404.html
├── css/
│   └── style.css
├── js/
│   ├── tailwind.config.js
│   ├── main.js
│   └── pages/
│       ├── login.js
│       ├── dashboard.js
│       ├── browse-rooms.js
│       ├── create-room.js
│       ├── game-discovery.js
│       ├── notifications.js
│       ├── profile.js
│       ├── room-details.js
│       └── schedule.js
└── img/
    └── .gitkeep
```

---

## Regras de extração dos stitch files

Cada `code.html` do stitch tem:
1. `<script id="tailwind-config">` — remover; substituir por `<script src="/js/tailwind.config.js"></script>`
2. `<style>` com classes utilitárias (`.glass-panel`, `.hero-gradient`, etc.) — remover; já estão em `css/style.css`
3. Links de fonte Google e CDN Tailwind — manter, consolidar em ordem correta
4. Nenhum `<script>` inline de lógica JS foi encontrado nos stitch files

**Ordem correta do `<head>` em todos os HTML:**
```html
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Joga Together | [Nome da Página]</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script src="/js/tailwind.config.js"></script>
<link rel="stylesheet" href="/css/style.css"/>
```

**Final do `<body>` em todos os HTML:**
```html
<script src="/js/main.js"></script>
<script src="/js/pages/[pagename].js"></script>
```

---

### Task 1: Scaffold — estrutura de diretórios e arquivos vazios

**Files:**
- Create: `css/style.css`
- Create: `js/tailwind.config.js`
- Create: `js/main.js`
- Create: `js/pages/login.js`
- Create: `js/pages/dashboard.js`
- Create: `js/pages/browse-rooms.js`
- Create: `js/pages/create-room.js`
- Create: `js/pages/game-discovery.js`
- Create: `js/pages/notifications.js`
- Create: `js/pages/profile.js`
- Create: `js/pages/room-details.js`
- Create: `js/pages/schedule.js`
- Create: `img/.gitkeep`
- Create: `.github/workflows/ci.yml`

**Step 1: Criar diretórios**
```bash
cd /home/jason/my-projects/github-ojasonw/joga-together/joga-together-web
mkdir -p css js/pages img .github/workflows
```

**Step 2: Criar arquivos JS vazios (stubs)**
```bash
touch js/pages/login.js js/pages/dashboard.js js/pages/browse-rooms.js \
      js/pages/create-room.js js/pages/game-discovery.js \
      js/pages/notifications.js js/pages/profile.js \
      js/pages/room-details.js js/pages/schedule.js \
      img/.gitkeep
```

**Step 3: Verificar estrutura**
```bash
find . -not -path './.git/*' -type f | sort
```
Expected: todos os arquivos listados na estrutura acima.

**Step 4: Commit**
```bash
git add css js img .github
git commit -m "chore: scaffold directory structure for joga-together-web"
```

---

### Task 2: css/style.css — classes utilitárias globais extraídas do stitch

**Files:**
- Create: `css/style.css`

As seguintes classes aparecem repetidas em todos os stitch files dentro de `<style>`:

**Step 1: Criar `css/style.css`**
```css
/* Base */
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #131313;
  color: #e5e2e1;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Utility classes do design system Zenith Pulse */
.glass-panel {
  background: rgba(58, 57, 57, 0.1);
  backdrop-filter: blur(20px);
}

.hero-gradient {
  background: linear-gradient(135deg, #4a1fa1 0%, #cfbcff 100%);
}

.text-gradient {
  background: linear-gradient(135deg, #4a1fa1 0%, #cfbcff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.primary-btn-gradient {
  background: linear-gradient(135deg, #4a1fa1 0%, #cfbcff 100%);
}

.ghost-border {
  border: 1px solid rgba(148, 142, 158, 0.15);
}

/* Cache busting hint para assets estáticos */
```

**Step 2: Verificar que o arquivo foi criado**
```bash
cat css/style.css
```

**Step 3: Commit**
```bash
git add css/style.css
git commit -m "feat: add shared CSS design tokens and utility classes"
```

---

### Task 3: js/tailwind.config.js — config Tailwind compartilhada

**Files:**
- Create: `js/tailwind.config.js`

A config é idêntica em todos os stitch files. Extrair para arquivo compartilhado.

**Step 1: Criar `js/tailwind.config.js`**
```js
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-bright": "#3a3939",
        "outline": "#948e9e",
        "primary-fixed-dim": "#cfbcff",
        "on-primary-fixed-variant": "#5229a9",
        "on-secondary-fixed": "#201340",
        "surface-container-lowest": "#0e0e0e",
        "on-tertiary-container": "#ef9561",
        "on-tertiary": "#542200",
        "surface-container": "#201f1f",
        "inverse-primary": "#6a45c2",
        "error-container": "#93000a",
        "background": "#131313",
        "on-surface-variant": "#cbc3d5",
        "surface-dim": "#131313",
        "surface-container-high": "#2a2a2a",
        "tertiary-fixed": "#ffdbca",
        "secondary": "#cebef6",
        "surface": "#131313",
        "on-primary": "#3b0092",
        "primary-container": "#4a1fa1",
        "on-error": "#690005",
        "on-primary-container": "#b69bff",
        "outline-variant": "#494453",
        "on-tertiary-fixed": "#331200",
        "on-surface": "#e5e2e1",
        "surface-container-highest": "#353534",
        "inverse-surface": "#e5e2e1",
        "tertiary-container": "#6b2d00",
        "on-error-container": "#ffdad6",
        "on-primary-fixed": "#22005c",
        "tertiary-fixed-dim": "#ffb68e",
        "on-tertiary-fixed-variant": "#753406",
        "on-background": "#e5e2e1",
        "on-secondary-container": "#bdade3",
        "secondary-container": "#4c3f6e",
        "secondary-fixed-dim": "#cebef6",
        "on-secondary": "#352956",
        "on-secondary-fixed-variant": "#4c3f6e",
        "surface-tint": "#cfbcff",
        "inverse-on-surface": "#313030",
        "surface-variant": "#353534",
        "tertiary": "#ffb68e",
        "secondary-fixed": "#e9ddff",
        "error": "#ffb4ab",
        "primary-fixed": "#e9ddff",
        "surface-container-low": "#1c1b1b",
        "primary": "#cfbcff"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans"],
        "body": ["Plus Jakarta Sans"],
        "label": ["Plus Jakarta Sans"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
};
```

**Step 2: Verificar**
```bash
cat js/tailwind.config.js | head -5
```
Expected: primeira linha é `tailwind.config = {`

**Step 3: Commit**
```bash
git add js/tailwind.config.js
git commit -m "feat: add shared Tailwind config extracted from stitch"
```

---

### Task 4: js/main.js — interações globais

**Files:**
- Create: `js/main.js`

Baseado no `main.js` do web-page de referência, adaptado para o design system do Joga Together.

**Step 1: Criar `js/main.js`**
```js
// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}

// Scroll reveal via IntersectionObserver
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), index * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Smooth scroll para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

**Step 2: Commit**
```bash
git add js/main.js
git commit -m "feat: add shared main.js with navbar, scroll reveal and smooth scroll"
```

---

### Task 5: Dockerfile + nginx.conf

**Files:**
- Create: `Dockerfile`
- Create: `nginx.conf`

Copiar exatamente do web-page de referência em `/home/jason/my-projects/github-ojasonw/personal/web-page/`.

**Step 1: Copiar Dockerfile**
```bash
cp /home/jason/my-projects/github-ojasonw/personal/web-page/Dockerfile .
```

**Step 2: Copiar nginx.conf**
```bash
cp /home/jason/my-projects/github-ojasonw/personal/web-page/nginx.conf .
```

**Step 3: Verificar Dockerfile**
```bash
cat Dockerfile
```
Expected: `FROM nginx:1.27-alpine`, COPY para `*.html`, `css/`, `js/`, `img/`

**Step 4: Commit**
```bash
git add Dockerfile nginx.conf
git commit -m "feat: add Dockerfile and nginx.conf for static site serving"
```

---

### Task 6: .github/workflows/ci.yml

**Files:**
- Create: `.github/workflows/ci.yml`

Copiar do web-page de referência e ajustar o nome da imagem.

**Step 1: Ler o ci.yml de referência**
```bash
cat /home/jason/my-projects/github-ojasonw/personal/web-page/.github/workflows/ci.yml
```

**Step 2: Criar `.github/workflows/ci.yml`**

Copiar o conteúdo do referência, alterando apenas o nome da imagem para `joga-together-web`.

**Step 3: Commit**
```bash
git add .github/workflows/ci.yml
git commit -m "chore: add CI workflow for Docker build validation"
```

---

### Task 7: docs/DESIGN-SYSTEM.md

**Files:**
- Create: `docs/DESIGN-SYSTEM.md`

Copiar o arquivo `DESIGN.md` do stitch (zenith_pulse) para `docs/DESIGN-SYSTEM.md`.

**Step 1: Copiar**
```bash
cp "/home/jason/Downloads/stitch (1)/stitch/zenith_pulse/DESIGN.md" docs/DESIGN-SYSTEM.md
```

**Step 2: Commit**
```bash
git add docs/DESIGN-SYSTEM.md
git commit -m "docs: add Zenith Pulse design system reference"
```

---

### Task 8: 404.html

**Files:**
- Create: `404.html`

O usuário forneceu o HTML completo da página 404. Criar o arquivo aplicando as regras de extração:
- Remover `<script id="tailwind-config">` e substituir por `<script src="/js/tailwind.config.js"></script>`
- Remover `<style>` inline (`.text-gradient`, `.primary-btn-gradient`, `.ghost-border`) — já estão em `css/style.css`
- Remover link duplicado de Material Symbols
- Adicionar `<link rel="stylesheet" href="/css/style.css"/>` no head
- Adicionar `<script src="/js/main.js"></script>` antes de `</body>`

**Step 1: Criar `404.html`** com o conteúdo fornecido pelo usuário, aplicando as transformações acima.

**Step 2: Verificar que não há `<script id="tailwind-config">` no arquivo**
```bash
grep "tailwind-config" 404.html
```
Expected: sem output (nenhuma ocorrência)

**Step 3: Verificar que style.css está referenciado**
```bash
grep "style.css" 404.html
```
Expected: `<link rel="stylesheet" href="/css/style.css"/>`

**Step 4: Commit**
```bash
git add 404.html
git commit -m "feat: add 404 page with Zenith Pulse design system"
```

---

### Task 9: index.html — Landing Page

**Source:** `/home/jason/Downloads/stitch (1)/stitch/landing_page_purple_accent/code.html`

**Files:**
- Create: `index.html`

**Step 1: Ler o arquivo fonte**
```bash
cat "/home/jason/Downloads/stitch (1)/stitch/landing_page_purple_accent/code.html"
```

**Step 2: Criar `index.html`** aplicando as regras de extração (ver seção "Regras de extração" acima):
- Title: `Joga Together | Home`
- Remover `<script id="tailwind-config">`
- Remover `<style>` inline
- Remover link duplicado de Material Symbols
- Adicionar referências externas no head e scripts no final do body

**Step 3: Verificar**
```bash
grep -c "tailwind-config\|<style>" index.html
```
Expected: `0`

**Step 4: Commit**
```bash
git add index.html
git commit -m "feat: add landing page (index.html)"
```

---

### Task 10: login.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/login_purple_accent/code.html`

**Files:**
- Create: `login.html`
- Modify: `js/pages/login.js` (adicionar lógica de formulário se necessário)

**Step 1: Ler o arquivo fonte**
```bash
cat "/home/jason/Downloads/stitch (1)/stitch/login_purple_accent/code.html"
```

**Step 2: Criar `login.html`** com as mesmas transformações. Title: `Joga Together | Login`

**Step 3: Verificar**
```bash
grep -c "tailwind-config\|<style>" login.html
```
Expected: `0`

**Step 4: Commit**
```bash
git add login.html js/pages/login.js
git commit -m "feat: add login page"
```

---

### Task 11: dashboard.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/main_dashboard_purple_accent/code.html`

**Files:**
- Create: `dashboard.html`

**Step 1:** Ler source, criar `dashboard.html`, aplicar transformações. Title: `Joga Together | Dashboard`

**Step 2: Verificar**
```bash
grep -c "tailwind-config\|<style>" dashboard.html
```
Expected: `0`

**Step 3: Commit**
```bash
git add dashboard.html js/pages/dashboard.js
git commit -m "feat: add dashboard page"
```

---

### Task 12: browse-rooms.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/browse_rooms_purple_accent/code.html`

**Files:**
- Create: `browse-rooms.html`

**Step 1:** Ler source, criar `browse-rooms.html`, aplicar transformações. Title: `Joga Together | Browse Rooms`

**Step 2: Commit**
```bash
git add browse-rooms.html js/pages/browse-rooms.js
git commit -m "feat: add browse rooms page"
```

---

### Task 13: create-room.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/create_room_purple_accent/code.html`

**Files:**
- Create: `create-room.html`

**Step 1:** Ler source, criar `create-room.html`, aplicar transformações. Title: `Joga Together | Create Room`

**Step 2: Commit**
```bash
git add create-room.html js/pages/create-room.js
git commit -m "feat: add create room page"
```

---

### Task 14: game-discovery.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/game_discovery_purple_accent/code.html`

**Files:**
- Create: `game-discovery.html`

**Step 1:** Ler source, criar `game-discovery.html`, aplicar transformações. Title: `Joga Together | Game Discovery`

**Step 2: Commit**
```bash
git add game-discovery.html js/pages/game-discovery.js
git commit -m "feat: add game discovery page"
```

---

### Task 15: notifications.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/notification_center_purple_accent/code.html`

**Files:**
- Create: `notifications.html`

**Step 1:** Ler source, criar `notifications.html`, aplicar transformações. Title: `Joga Together | Notifications`

**Step 2: Commit**
```bash
git add notifications.html js/pages/notifications.js
git commit -m "feat: add notifications page"
```

---

### Task 16: profile.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/profile_preferences_purple_accent/code.html`

**Files:**
- Create: `profile.html`

**Step 1:** Ler source, criar `profile.html`, aplicar transformações. Title: `Joga Together | Profile`

**Step 2: Commit**
```bash
git add profile.html js/pages/profile.js
git commit -m "feat: add profile page"
```

---

### Task 17: room-details.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/room_details_purple_accent/code.html`

**Files:**
- Create: `room-details.html`

**Step 1:** Ler source, criar `room-details.html`, aplicar transformações. Title: `Joga Together | Room Details`

**Step 2: Commit**
```bash
git add room-details.html js/pages/room-details.js
git commit -m "feat: add room details page"
```

---

### Task 18: schedule.html

**Source:** `/home/jason/Downloads/stitch (1)/stitch/schedule_flow_purple_accent/code.html`

**Files:**
- Create: `schedule.html`

**Step 1:** Ler source, criar `schedule.html`, aplicar transformações. Title: `Joga Together | Schedule`

**Step 2: Commit**
```bash
git add schedule.html js/pages/schedule.js
git commit -m "feat: add schedule page"
```

---

### Task 19: Verificação final — Docker build

**Step 1: Verificar que todos os arquivos HTML estão presentes**
```bash
ls *.html
```
Expected: `index.html login.html dashboard.html browse-rooms.html create-room.html game-discovery.html notifications.html profile.html room-details.html schedule.html 404.html`

**Step 2: Verificar que nenhum HTML ainda tem config inline**
```bash
grep -l "tailwind-config\|id=\"tailwind-config\"" *.html
```
Expected: sem output

**Step 3: Build Docker**
```bash
docker build -t joga-together-web:local .
```
Expected: `Successfully built` sem erros

**Step 4: Smoke test — rodar container e checar healthz**
```bash
docker run -d --name jt-web-test -p 8090:80 joga-together-web:local
sleep 2
curl -s http://localhost:8090/healthz
docker stop jt-web-test && docker rm jt-web-test
```
Expected: `ok`

**Step 5: Commit final**
```bash
git add -A
git commit -m "chore: verify all pages present and Docker build passes"
```
