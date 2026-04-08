# Deploy: Vercel + Railway

Esta es la forma más simple de publicar este proyecto sin reescribir el backend.

## Arquitectura recomendada

- `Vercel`: frontend Vue/Vite
- `Railway`: backend Express
- `Railway Volume`: base SQLite persistente

## 1. Backend en Railway

1. Crea un proyecto nuevo en Railway.
2. Conecta este repositorio de GitHub.
3. En el servicio backend usa estos valores:

- Start Command: `npm start`
- Healthcheck Path: `/api/health`

4. Crea un `Volume` y móntalo en:

```txt
/data
```

5. Agrega estas variables de entorno:

```txt
PORT=3000
SQLITE_DB_PATH=/data/pos.sqlite
ALLOWED_ORIGINS=https://TU-FRONTEND.vercel.app
```

Si luego agregas un dominio propio o preview URLs, puedes poner varios orígenes separados por coma.

Ejemplo:

```txt
ALLOWED_ORIGINS=https://tu-pos.vercel.app,https://tu-dominio.com
```

## 2. Frontend en Vercel

1. Importa el mismo repositorio en Vercel.
2. Framework preset: `Vite`
3. Build command:

```txt
npm run build
```

4. Output directory:

```txt
dist
```

5. Agrega esta variable de entorno:

```txt
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
```

## 3. Primer inicio

Cuando Railway arranque por primera vez:

- crea el archivo SQLite en la ruta de `SQLITE_DB_PATH`
- crea las tablas necesarias
- crea el usuario por defecto:

```txt
admin / 1234
```

## 4. Verificación

Backend:

```txt
https://TU-BACKEND.up.railway.app/api/health
```

Debe responder algo como:

```json
{
  "status": "ok"
}
```

Frontend:

- abre tu URL de Vercel
- inicia sesión con `admin / 1234`
- crea un producto
- registra una venta

## 5. Notas importantes

- La base de datos ahora puede apuntar a cualquier ruta usando `SQLITE_DB_PATH`.
- Si no montas el volume en Railway, el archivo SQLite puede perderse al redeployar.
- El frontend ya soporta usar una API remota mediante `VITE_API_URL`.
