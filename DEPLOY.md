# Deploy com Docker

Stack: **Next.js 16 (standalone) + MariaDB LTS + phpMyAdmin**, com ffmpeg incluído
(conversão automática de vídeos para MP4 no upload).

## Portas

| Serviço            | Porta no host |
| ------------------ | ------------- |
| App (DryMusic)     | **3031**      |
| MariaDB            | **3331**      |
| phpMyAdmin         | **8031**      |

## Arrancar

```bash
docker compose up -d --build
```

- App: http://localhost:3031
- phpMyAdmin: http://localhost:8031 (user `drymusic` / senha `drymusic`, ou `root` / `drymusic_root`)
- MariaDB externo: `mysql://drymusic:drymusic@localhost:3331/drymusic`

As migrações Prisma são aplicadas automaticamente (serviço `migrate`) antes da app arrancar.

## Senhas (produção)

Define variáveis antes do `up` (ou num ficheiro `.env` ao lado do compose):

```bash
DB_ROOT_PASSWORD=...   # root do MariaDB
DB_PASSWORD=...        # user drymusic
ADMIN_PASSWORD=...     # senha do admin da app
SESSION_SECRET=...     # segredo dos cookies de sessão (string longa aleatória)
```

## Dados persistentes

- `db_data` (volume): base de dados
- `media` (volume): ficheiros de música/vídeo e capas

## Atualizar a app

```bash
git pull        # ou copiar o código novo
docker compose up -d --build
```
