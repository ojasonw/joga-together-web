# Joga Together — Web

Frontend estático do **Joga Together**, plataforma para jogadores encontrarem salas, sessões e parceiros de jogo. Servido via nginx, construído com HTML puro, Tailwind CSS (CDN) e JavaScript vanilla.

> Backend: [`my-java-app`](../my-java-app) — Spring Boot 3.5.10 + JWT + PostgreSQL

---

## Stack

- **HTML5** — sem framework, sem bundler
- **Tailwind CSS** via CDN + `js/tailwind.config.js` (tema Zenith Pulse)
- **JavaScript ES6+** vanilla — `js/api.js` como cliente HTTP central
- **nginx 1.27-alpine** — URLs limpas, cache de assets, headers de segurança
- **Docker** — build multi-stage, pronto para produção

---

## Rodando localmente

### Com Docker (recomendado)

```bash
docker compose up --build
```

Acesse em: [http://localhost:8080](http://localhost:8080)

### Sem Docker

Qualquer servidor HTTP estático serve. Exemplo com Python:

```bash
python3 -m http.server 8080
```

> URLs limpas (`/login`, `/dashboard`) só funcionam com nginx. Com o servidor Python as rotas diretas retornam 404 — use os links internos de navegação.

---

## Estrutura

```
joga-together-web/
├── index.html              # Landing page (pública)
├── 404.html                # Página de erro
├── pages/                  # Páginas da aplicação
│   ├── login.html
│   ├── dashboard.html
│   ├── browse-rooms.html
│   ├── create-room.html
│   ├── game-discovery.html
│   ├── notifications.html
│   ├── profile.html
│   ├── room-details.html
│   └── schedule.html
├── css/
│   └── style.css           # Tokens de design e overrides globais
├── js/
│   ├── tailwind.config.js  # Paleta de cores (Zenith Pulse)
│   ├── main.js             # Navbar, menu mobile, scroll reveal
│   ├── api.js              # Cliente HTTP, Auth, guards, utilitários
│   └── pages/              # Lógica específica de cada página
├── img/
├── nginx.conf
├── Dockerfile
└── docs/
    ├── ARCHITECTURE.md     # Arquitetura atual e prevista
    └── DESIGN-SYSTEM.md
```

---

## Rotas

| URL                | Página                        |
|--------------------|-------------------------------|
| `/`                | Landing page                  |
| `/login`           | Sign in / Sign up / Confirmar |
| `/dashboard`       | Home pós-login                |
| `/browse-rooms`    | Explorar salas                |
| `/create-room`     | Criar nova sala               |
| `/game-discovery`  | Catálogo de jogos             |
| `/notifications`   | Notificações                  |
| `/profile`         | Perfil do jogador             |
| `/room-details`    | Detalhes de uma sala          |
| `/schedule`        | Sessões agendadas             |
| `/healthz`         | Health check (nginx)          |

Trailing slashes e extensões `.html` são redirecionados automaticamente (301).

---

## Integrações com o Backend

O cliente HTTP em `js/api.js` usa `window.API_BASE_URL` (padrão: `http://localhost:8081`).  
O token JWT é armazenado em `localStorage` (`jt_token`).

| Endpoint                        | Página           | Status       |
|---------------------------------|------------------|--------------|
| `POST /auth/login`              | login            | Integrado    |
| `POST /users/create`            | login (sign up)  | Integrado    |
| `PATCH /users/confirm-code`     | login (confirm)  | Integrado    |
| `GET /games/all`                | game-discovery   | Integrado    |
| `GET /scheduling/all`           | schedule         | Integrado    |
| `POST /groups/create`           | create-room      | Integrado    |
| `GET /users/me`                 | profile, dashboard | Pendente   |
| `GET /groups/all`               | browse-rooms     | Pendente     |
| `GET /groups/{id}`              | room-details     | Pendente     |

Veja [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para o estado completo e endpoints pendentes no backend.

---

## Variáveis de ambiente

Para apontar para um backend diferente, defina antes de carregar os scripts:

```html
<script>window.API_BASE_URL = 'https://api.seudominio.com';</script>
```

Ou via nginx, injetando a variável no HTML no startup do container.

---

## Deploy

```bash
docker build -t joga-together-web .
docker run -p 8080:80 joga-together-web
```

Em produção, os dois serviços (web + api) rodam na mesma máquina via Docker network — veja o diagrama em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
