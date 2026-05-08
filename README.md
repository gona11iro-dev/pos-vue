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

## Escritorio con Electron

El proyecto ya puede correr como app de escritorio para Linux usando Electron. La app levanta:

- Un lanzador para abrir el POS en escritorio o navegador
- API Express embebida
- SQLite persistente dentro del directorio de usuario de la app

Modo desarrollo:

```sh
npm run electron:dev
```

Empaquetar Linux:

```sh
npm run electron:build
```

Esto genera dos opciones:

- `dist-electron/POS Tio Ale-0.1.1-linux-x64.tar.gz`: bundle portable con `install.sh`
- `dist-electron/POS Tio Ale-0.1.1-amd64.deb`: paquete para Debian, Ubuntu, Kali y derivadas

Uso:

```sh
cd dist-electron
tar -xzf "POS Tio Ale-0.1.1-linux-x64.tar.gz"
cd "POS Tio Ale-0.1.1-linux-x64"
./install.sh
```

### Abrir con doble clic

El bundle `.tar.gz` ya incluye `install.sh`, que:

- copia la app a `~/.local/opt/pos-tio-ale`
- crea acceso en el menú
- crea acceso en el escritorio si existe `~/Desktop` o `~/Escritorio`
- usa el icono del APK Android del proyecto

Si estás en Debian, Ubuntu o Kali también puedes instalar el `.deb`:

```sh
sudo apt install ./dist-electron/POS\ Tio\ Ale-0.1.1-amd64.deb
```

Notas:

- Hace falta instalar `electron` y `electron-builder` antes de usar esos scripts.
- La base de datos en escritorio no se guarda dentro del repo, sino en el `userData` de Electron.

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
