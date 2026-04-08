# pos-vue

POS hecho con `Vue 3 + Vite` en frontend y `Express + SQLite` en backend.

## Requisitos

- `Node.js 20.19+`
- `npm`

## Desarrollo local

Instala dependencias:

```sh
npm install
```

Levanta frontend y backend al mismo tiempo:

```sh
npm run dev-all
```

Servicios locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Healthcheck backend: `http://localhost:3000/api/health`

## Variables de entorno

Toma como base el archivo [.env.example](./.env.example).

Variables importantes:

- `VITE_API_URL`: URL del backend para la web
- `PORT`: puerto del backend
- `SQLITE_DB_PATH`: ruta del archivo SQLite
- `ALLOWED_ORIGINS`: orígenes permitidos por CORS separados por coma

## Deploy

La ruta recomendada para este proyecto es:

- Frontend en `Vercel`
- Backend en `Railway`
- SQLite persistente en un `Volume` de Railway

La guía completa quedó en [DEPLOY.md](./DEPLOY.md).
