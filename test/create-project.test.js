import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, access, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProject } from '../lib/create-project.js';

test('copies the pinned revision without Git history and protects existing paths', async () => {
  const root = await mkdtemp(join(tmpdir(), 'caveat-test-'));
  try {
    const repo = join(root, 'source');
    execFileSync('git', ['init', '--quiet', repo]);
    const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
    await writeFile(join(repo, 'README.md'), 'Pinned content');
    await writeFile(join(repo, '.gitignore'), 'node_modules/\n');
    await writeFile(join(repo, 'package.json'), JSON.stringify({ scripts: { dev: 'next dev', build: 'next build' }, dependencies: { next: '16.3.4' } }));
    await writeFile(join(repo, 'package-lock.json'), '{}');
    await mkdir(join(repo, 'src', 'app'), { recursive: true });
    await mkdir(join(repo, 'prisma'));
    await mkdir(join(repo, 'scripts'));
    await writeFile(join(repo, 'src', 'app', 'page.tsx'), 'export default function Page() { return <h1>Hello</h1>; }');
    await writeFile(join(repo, 'prisma', 'schema.prisma'), 'datasource db { provider = "postgresql" }');
    await writeFile(join(repo, 'scripts', 'dev.mjs'), '// Starts the application and database');
    git('add', '.');
    git('-c', 'user.name=Caveat Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Fixture');
    const revision = git('rev-parse', 'HEAD');
    await writeFile(join(repo, 'README.md'), 'Newer content');
    git('add', '.');
    git('-c', 'user.name=Caveat Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Newer revision');
    const source = { repository: repo, revision };
    const target = join(root, 'publication');
    await createProject(target, source);
    assert.equal(await readFile(join(target, 'README.md'), 'utf8'), 'Pinned content');
    assert.equal(await readFile(join(target, '.gitignore'), 'utf8'), 'node_modules/\n');
    await assert.rejects(access(join(target, '.git')), { code: 'ENOENT' });
    await assert.rejects(createProject(target, source), { code: 'EEXIST' });
    assert.equal(await readFile(join(target, 'README.md'), 'utf8'), 'Pinned content');
    const failed = join(root, 'failed');
    await assert.rejects(createProject(failed, { repository: repo, revision: 'nonexistent' }));
    await assert.rejects(access(failed), { code: 'ENOENT' });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('CLI explains the runnable app and rejects invalid arguments', () => {
  const bin = fileURLToPath(new URL('../bin/create-caveat.js', import.meta.url));
  const output = execFileSync(process.execPath, [bin, '--help'], { encoding: 'utf8' });
  assert.match(output, /Creates a working publication/);
  assert.match(output, /npm create caveat@latest/);
  assert.throws(() => execFileSync(process.execPath, [bin, '--unknown'], { stdio: 'pipe' }), { status: 1 });
});

test('rejects documentation-only templates instead of reporting success', async () => {
  const root = await mkdtemp(join(tmpdir(), 'caveat-incomplete-'));
  try {
    const repo = join(root, 'source');
    execFileSync('git', ['init', '--quiet', repo]);
    await writeFile(join(repo, 'README.md'), 'Only documentation');
    execFileSync('git', ['-C', repo, 'add', '.']);
    execFileSync('git', ['-C', repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', 'commit', '-qm', 'Incomplete']);
    const revision = execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    const target = join(root, 'publication');
    await assert.rejects(createProject(target, { repository: repo, revision }));
    await assert.rejects(access(target), { code: 'ENOENT' });
  } finally { await rm(root, { recursive: true, force: true }); }
});
