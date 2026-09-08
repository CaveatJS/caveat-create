import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, readFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export const repository = 'https://github.com/CaveatJS/site.git';
export const revision = 'f5efcd77289909eec029e682387381c0d495d5bd';

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
    // Do not report success for a documentation-only or incomplete template.
    const manifest = JSON.parse(await readFile(join(checkout, 'package.json'), 'utf8'));
    if (!manifest.scripts?.dev || !manifest.scripts?.build || !manifest.dependencies?.next) {
      throw new Error('The Caveat template is not a runnable app. No project was created.');
    }
    await access(join(checkout, 'app', 'page.tsx'));
    await access(join(checkout, 'package-lock.json'));
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
