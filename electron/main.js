import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const serverPort = Number(process.env.ELECTRON_API_PORT || 3000);
const serverOrigin = `http://127.0.0.1:${serverPort}`;
const commonBrowsers = [
  { id: 'default', label: 'Predeterminado del sistema' },
  { id: 'chrome', label: 'Google Chrome', commands: ['google-chrome', 'google-chrome-stable'] },
  { id: 'chromium', label: 'Chromium', commands: ['chromium', 'chromium-browser'] },
  { id: 'brave', label: 'Brave', commands: ['brave-browser', 'brave'] },
  { id: 'firefox', label: 'Firefox', commands: ['firefox'] },
  { id: 'edge', label: 'Microsoft Edge', commands: ['microsoft-edge', 'microsoft-edge-stable'] },
  { id: 'opera', label: 'Opera', commands: ['opera'] },
];

let mainWindow;
let launcherWindow;
let serverInstance;
let databasePath;

async function startEmbeddedServer() {
  process.env.PORT = String(serverPort);
  process.env.SQLITE_DB_PATH = path.join(app.getPath('userData'), 'data', 'pos.sqlite');
  process.env.SERVE_WEB_APP = 'true';
  databasePath = process.env.SQLITE_DB_PATH;

  const { startServer } = await import('../server/index.js');
  serverInstance = startServer(serverPort);
}

function findInstalledBrowsers() {
  return commonBrowsers.filter(browser => {
    if (!browser.commands) {
      return true;
    }

    return browser.commands.some(command => {
      try {
        execFileSync('which', [command], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
  });
}

function createDesktopWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay();
  const minWidth = Math.min(900, Math.max(640, workAreaSize.width - 80));
  const minHeight = Math.min(620, Math.max(480, workAreaSize.height - 80));
  const width = Math.min(1366, Math.max(minWidth, Math.floor(workAreaSize.width * 0.92)));
  const height = Math.min(900, Math.max(minHeight, Math.floor(workAreaSize.height * 0.9)));

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth,
    minHeight,
    resizable: true,
    minimizable: true,
    maximizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--pos-api-url=http://127.0.0.1:${serverPort}/api`],
    },
  });

  if (isDev) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    return;
  }

  mainWindow.loadURL(serverOrigin);
}

function createLauncherWindow() {
  launcherWindow = new BrowserWindow({
    width: 760,
    height: 560,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: [`--pos-api-url=${serverOrigin}/api`],
    },
  });

  launcherWindow.loadFile(path.join(__dirname, 'launcher.html'));
}

function openInBrowser(browserId) {
  const url = isDev ? (process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5173') : serverOrigin;
  if (!browserId || browserId === 'default') {
    return shell.openExternal(url).then(() => ({ ok: true }));
  }

  const browser = commonBrowsers.find(item => item.id === browserId);
  if (!browser?.commands?.length) {
    return Promise.resolve({ ok: false, error: 'Navegador no disponible.' });
  }

  for (const command of browser.commands) {
    try {
      execFileSync('which', [command], { stdio: 'ignore' });
      const child = spawn(command, [url], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      return Promise.resolve({ ok: true });
    } catch {
      continue;
    }
  }

  return Promise.resolve({ ok: false, error: `No se pudo abrir ${browser.label}.` });
}

app.whenReady().then(async () => {
  await startEmbeddedServer();
  createLauncherWindow();

  ipcMain.handle('launcher:get-state', () => ({
    appUrl: isDev ? (process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5173') : serverOrigin,
    dbPath: databasePath,
    browsers: findInstalledBrowsers().map(browser => ({ id: browser.id, label: browser.label })),
  }));

  ipcMain.handle('launcher:open-desktop', () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createDesktopWindow();
      return { ok: true };
    }

    mainWindow.focus();
    return { ok: true };
  });

  ipcMain.handle('launcher:open-browser', (_event, browserId) => openInBrowser(browserId));
  ipcMain.handle('launcher:open-default-browser', () => openInBrowser('default'));

  app.on('activate', () => {
    if (!launcherWindow || launcherWindow.isDestroyed()) {
      createLauncherWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverInstance) {
    serverInstance.close();
  }
});
