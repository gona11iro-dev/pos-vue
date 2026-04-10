import http from 'node:http';
import { spawn } from 'node:child_process';

const devServerUrl = process.env.ELECTRON_RENDERER_URL || 'http://127.0.0.1:5173';
const timeoutMs = 30000;
const retryMs = 500;

function checkUrl(url) {
  return new Promise(resolve => {
    const req = http.get(url, res => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 500);
    });

    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForDevServer() {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await checkUrl(devServerUrl)) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, retryMs));
  }

  throw new Error(`Vite no respondió en ${devServerUrl} dentro de ${timeoutMs}ms`);
}

async function main() {
  await waitForDevServer();

  const child = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_RENDERER_URL: devServerUrl,
    },
  });

  child.on('exit', code => {
    process.exit(code ?? 0);
  });
}

main().catch(error => {
  console.error('[electron-dev]', error.message);
  process.exit(1);
});
