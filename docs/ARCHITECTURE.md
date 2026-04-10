# Joga Together — Web Architecture

## Visão Geral

Aplicação web estática servida via **nginx**, construída com HTML puro, Tailwind CSS (CDN) e JavaScript vanilla. O frontend consome uma API REST em Spring Boot (projeto separado: `my-java-app`).

---

## Estrutura Atual

```
joga-together-web/
│
├── index.html                      # Landing page (pública)
├── 404.html                        # Página de erro
│
├── pages/                          # Páginas internas da aplicação
│   ├── login.html                  # Autenticação (sign in / sign up / confirm)
│   ├── dashboard.html              # Home pós-login
│   ├── browse-rooms.html           # Explorar salas disponíveis
│   ├── create-room.html            # Criar nova sala (grupo)
│   ├── game-discovery.html         # Catálogo de jogos
│   ├── notifications.html          # Central de notificações
│   ├── profile.html                # Perfil e preferências do jogador
│   ├── room-details.html           # Detalhes de uma sala específica
│   └── schedule.html               # Agendamento de sessões
│
├── css/
│   └── style.css                   # Design tokens, utilidades e overrides globais
│
├── js/
│   ├── tailwind.config.js          # Paleta de cores e tipografia (Zenith Pulse theme)
│   ├── main.js                     # Navbar scroll, mobile menu, scroll reveal
│   ├── api.js                      # Cliente HTTP, Auth helpers, guards e UI utils
│   └── pages/
│       ├── login.js                # ✅ Sign in / sign up / confirm code
│       ├── dashboard.js            # ✅ Auth guard + exibição do usuário
│       ├── game-discovery.js       # ✅ GET /games/all → tabela dinâmica
│       ├── schedule.js             # ✅ GET /scheduling/all → lista de sessões
│       ├── create-room.js          # ✅ POST /groups/create → criação de sala
│       ├── browse-rooms.js         # 🔜 Aguarda endpoint GET /groups/all
│       ├── notifications.js        # 🔜 Aguarda endpoint de notificações
│       ├── profile.js              # 🔜 Aguarda endpoint GET /users/me
│       └── room-details.js         # 🔜 Aguarda endpoint GET /groups/{id}
│
├── img/                            # Assets de imagem
│
├── nginx.conf                      # Roteamento, redirects e cache de assets
├── Dockerfile                      # Build multi-stage: nginx:1.27-alpine
└── docs/
    ├── DESIGN-SYSTEM.md
    └── ARCHITECTURE.md             # Este arquivo
```

### Roteamento nginx (URLs limpas)

| Requisição          | Serve                          |
|---------------------|-------------------------------|
| `/`                 | `index.html`                  |
| `/login`            | `pages/login.html`            |
| `/dashboard`        | `pages/dashboard.html`        |
| `/browse-rooms`     | `pages/browse-rooms.html`     |
| `/create-room`      | `pages/create-room.html`      |
| `/game-discovery`   | `pages/game-discovery.html`   |
| `/notifications`    | `pages/notifications.html`    |
| `/profile`          | `pages/profile.html`          |
| `/room-details`     | `pages/room-details.html`     |
| `/schedule`         | `pages/schedule.html`         |
| `/login/`           | 301 → `/login`                |
| `/login.html`       | 301 → `/login`                |
| `/healthz`          | `200 ok`                      |

---

## Integrações com o Backend (Estado Atual)

Backend: `my-java-app` — Spring Boot 3.5.10, JWT, PostgreSQL  
Base URL configurável em `js/api.js` via `window.API_BASE_URL` (padrão: `http://localhost:8090`)

| Endpoint Backend           | Página             | Status       |
|----------------------------|--------------------|--------------|
| `POST /auth/login`         | login              | ✅ Integrado |
| `POST /users/create`       | login (sign up)    | ✅ Integrado |
| `PATCH /users/confirm-code`| login (confirm)    | ✅ Integrado |
| `GET /games/all`           | game-discovery     | ✅ Integrado |
| `GET /scheduling/all`      | schedule           | ✅ Integrado |
| `POST /groups/create`      | create-room        | ✅ Integrado |
| `PATCH /groups/{id}/add-user/{userId}` | room-details | 🔜 Pendente |
| `GET /groups/all`          | browse-rooms       | ❌ Não existe ainda |
| `GET /groups/{id}`         | room-details       | ❌ Não existe ainda |
| `GET /users/me`            | profile, dashboard | ❌ Não existe ainda |

> **Pendência crítica:** O endpoint `POST /auth/login` retorna apenas o token JWT.
> Para `POST /groups/create` funcionar completamente, o backend precisa expor
> `GET /users/me` retornando o UUID do usuário, ou incluí-lo na resposta do login.

> **CORS:** Ainda não configurado no backend. Necessário antes de qualquer
> chamada real do browser. Adicionar `CorsConfig.java` no backend com a origem
> do frontend (`http://localhost:8080` em dev).

---

## Estrutura Prevista ao Final do Projeto

```
joga-together-web/
│
├── index.html
├── 404.html
│
├── pages/
│   └── (mesmo conjunto atual)
│
├── css/
│   └── style.css
│
├── js/
│   ├── tailwind.config.js
│   ├── main.js
│   ├── api.js                      # Expandido com retry, interceptors
│   └── pages/
│       ├── login.js                # ✅ Completo
│       ├── dashboard.js            # + stats do usuário via GET /users/me
│       ├── game-discovery.js       # ✅ Completo + filtros por gênero
│       ├── schedule.js             # ✅ Completo + criar agendamento pelo calendário
│       ├── create-room.js          # ✅ Completo (depende de masterId via /users/me)
│       ├── browse-rooms.js         # Lista e filtra salas via GET /groups/all
│       ├── notifications.js        # Notificações em tempo real
│       ├── profile.js              # Editar perfil via PUT /users/{id}
│       └── room-details.js         # Entrar na sala via PATCH /groups/{id}/add-user/{id}
│
├── img/
│
├── nginx.conf
├── Dockerfile
└── docs/
```

### Deploy final — dois serviços na mesma máquina

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │   web (nginx)    │      │    api (Spring Boot)     │ │
│  │  :8080 → :80     │─────▶│    :8081 → :8080         │ │
│  │                  │      │                          │ │
│  │  /               │      │  /auth/**  (público)     │ │
│  │  /login          │      │  /users/** (público)     │ │
│  │  /dashboard      │      │  /games/** (JWT)         │ │
│  │  /game-discovery │      │  /groups/** (JWT)        │ │
│  │  ...             │      │  /scheduling/** (JWT)    │ │
│  └──────────────────┘      └──────────────────────────┘ │
│                                      │                   │
│                             ┌────────▼──────────┐        │
│                             │  PostgreSQL :5432  │        │
│                             │  db: joga-db       │        │
│                             └────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Endpoints ainda necessários no backend

| Endpoint                      | Usado em              | Prioridade |
|-------------------------------|-----------------------|------------|
| `GET /users/me`               | profile, dashboard, create-room | 🔴 Alta |
| `GET /groups/all`             | browse-rooms          | 🔴 Alta |
| `GET /groups/{id}`            | room-details          | 🔴 Alta |
| `POST /games/create`          | admin / game-discovery| 🟡 Média  |
| `PUT /users/{id}`             | profile (editar)      | 🟡 Média  |
| `DELETE /groups/{id}`         | room-details (host)   | 🟢 Baixa  |
| `GET /notifications`          | notifications         | 🟢 Baixa  |

### Configurações pendentes no backend

- [ ] `CorsConfig.java` — liberar origem do frontend
- [ ] Retornar UUID do usuário no login ou via `GET /users/me`
- [ ] Variáveis de ambiente documentadas (`.env.example`)

---

*Atualizado em: 2026-04-02*
