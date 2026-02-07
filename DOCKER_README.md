# 🐳 VertexHub - Deploy com Docker

Aplicação dockerizada pronta para deploy no EasyPanel ou qualquer plataforma Docker.

## 📦 Estrutura

```
vertexhub/
├── apps/
│   ├── api/
│   │   ├── Dockerfile          # 🐳 Container da API NestJS
│   │   └── ...
│   └── web/
│       ├── Dockerfile          # 🐳 Container do Next.js
│       └── ...
├── docker-compose.yml          # 🔧 Orquestração local
├── .dockerignore               # 📋 Otimização de build
└── .env.example                # 📝 Template de variáveis
```

## 🚀 Deploy no EasyPanel

Veja o guia completo: **[EASYPANEL_GUIDE.md](./EASYPANEL_GUIDE.md)**

## 🧪 Teste Local com Docker

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 2. Iniciar aplicação

```bash
docker-compose up --build
```

### 3. Acessar

- Frontend: http://localhost:3000
- API: http://localhost:3001

## 📚 Requisitos

- Docker 20+
- Docker Compose 2+
- PostgreSQL (externo ou via EasyPanel)

## 🔑 Variáveis de Ambiente Necessárias

### API:
- `DATABASE_URL` - URL do PostgreSQL
- `JWT_SECRET` - Secret para JWT
- `JWT_EXPIRATION` - Tempo de expiração (ex: 1d)

### Web:
- `AUTH_SECRET` - Secret do NextAuth
- `AUTH_URL` - URL pública do frontend
- `NEXT_PUBLIC_API_URL` - URL pública da API
- `API_URL` - URL interna da API (para SSR)

## 📖 Documentos

- [Guia EasyPanel](./EASYPANEL_GUIDE.md) - Passo a passo completo
- [Plano de Implementação](./implementation_plan.md) - Detalhes técnicos
