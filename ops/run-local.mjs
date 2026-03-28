import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const cwd = process.cwd();
const useShell = process.platform === 'win32';

if (!existsSync(join(cwd, 'node_modules'))) {
  const install = spawnSync('pnpm', ['install'], {
    cwd,
    shell: useShell,
    stdio: 'inherit',
  });

  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }
}

const devServer = spawn('pnpm', ['dev:host'], {
  cwd,
  shell: useShell,
  stdio: 'inherit',
});

devServer.on('close', (code) => {
  process.exit(code ?? 0);
});
