import { spawnSync } from 'node:child_process';

const composeArgs = ['compose', '-f', './ops/compose.yml'];
const healthUrl = 'http://localhost:8090';
const useShell = process.platform === 'win32';

ensureDocker();
runCompose(['up', '--build', '-d']);
await waitUntilReady();
printSuccess();

function ensureDocker() {
  const dockerCheck = spawnSync('docker', ['--version'], {
    shell: useShell,
    stdio: 'ignore',
  });
  const composeCheck = spawnSync('docker', ['compose', 'version'], {
    shell: useShell,
    stdio: 'ignore',
  });

  if (dockerCheck.status !== 0 || composeCheck.status !== 0) {
    console.error('Docker and docker compose must be installed and available in PATH.');
    process.exit(1);
  }
}

function runCompose(args) {
  const result = spawnSync('docker', [...composeArgs, ...args], {
    shell: useShell,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function waitUntilReady() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 60_000) {
    try {
      const response = await fetch(healthUrl, {
        method: 'HEAD',
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Container is still starting.
    }

    await sleep(1_000);
  }

  console.error('Docker container did not become ready within 60 seconds.');
  runCompose(['logs', '--tail', '100']);
  process.exit(1);
}

function printSuccess() {
  console.log('');
  console.log(`TON Wallet is running in Docker: ${healthUrl}`);
  console.log('Stop it with: pnpm docker:down');
  console.log('View logs with: pnpm docker:logs');
}

function sleep(durationMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}
