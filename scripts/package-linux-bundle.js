import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const rootDir = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const productName = packageJson.build?.productName || packageJson.name;
const version = packageJson.version;
const distDir = path.join(rootDir, 'dist-electron');
const unpackedDir = path.join(distDir, 'linux-unpacked');
const bundleDirName = `${productName}-${version}-linux-x64`;
const bundleDir = path.join(distDir, bundleDirName);
const tarName = `${bundleDirName}.tar.gz`;
const tarPath = path.join(distDir, tarName);
const iconSource = path.join(rootDir, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png');
const installerSource = path.join(rootDir, 'scripts', 'install-linux.sh');

if (!fs.existsSync(unpackedDir)) {
  throw new Error(`No existe linux-unpacked en ${unpackedDir}`);
}

fs.rmSync(bundleDir, { recursive: true, force: true });
fs.mkdirSync(bundleDir, { recursive: true });
fs.cpSync(unpackedDir, path.join(bundleDir, 'app'), { recursive: true });
fs.copyFileSync(iconSource, path.join(bundleDir, 'icon.png'));
fs.copyFileSync(installerSource, path.join(bundleDir, 'install.sh'));
fs.chmodSync(path.join(bundleDir, 'install.sh'), 0o755);

fs.rmSync(tarPath, { force: true });
execFileSync('tar', ['-czf', tarPath, '-C', distDir, bundleDirName], { stdio: 'inherit' });

console.log(`[package-linux-bundle] Created ${tarPath}`);
