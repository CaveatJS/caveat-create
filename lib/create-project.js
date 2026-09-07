import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const repository = 'https://github.com/Caveat-Newsletter/site.git';
export const revision = '202790233f2e6b7062a39664b937508d7876203e';

// The source override is for local tests, not a public CLI option.
export async function createProject(directory, source = { repository, revision }) {
  const target = resolve(directory);
  // Reserve the destination before downloading. Never overwrite an existing path.
  await mkdir(target);
  let temporary;
  try {
    temporary = await mkdtemp(join(tmpdir(), 'create-caveat-'));
    const checkout = join(temporary, 'site');
    const git = (args) => execFileSync('git', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120_000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    });
    git(['init', '--quiet', checkout]);
    git(['-C', checkout, 'fetch', '--quiet', '--depth=1', '--', source.repository, source.revision]);
    git(['-C', checkout, 'checkout', '--quiet', '--detach', 'FETCH_HEAD']);
    await cp(checkout, target, {
      recursive: true,
      force: false,
      errorOnExist: true,
      filter: (path) => path !== join(checkout, '.git'),
    });
    return target;
  } catch (error) {
    await rm(target, { recursive: true, force: true });
    throw error;
  } finally {
    if (temporary) await rm(temporary, { recursive: true, force: true });
  }
}
