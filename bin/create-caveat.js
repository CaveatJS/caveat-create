#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { createProject } from '../lib/create-project.js';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const help = `Create Caveat ${version}

Usage: npm create caveat@latest [directory]

Creates a working publication with an owner dashboard and installs dependencies.
Requires Node.js 22.12+, Git, and access to GitHub and npm.
Existing directories are never overwritten.

Includes a rich-text editor, Prisma Postgres, email/password sign-in, and RSS.
Connect Resend for newsletters. Deploy the same app to your Vercel account.

Options:
  --help, -h     Show help
  --version, -v  Show version
  --skip-install  Create the project without installing dependencies`;

async function main() {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(help);
    return;
  }
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    console.log(version);
    return;
  }
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) {
    throw new Error('Caveat needs Node.js 22.12 or newer. Update Node.js, then run this command again.');
  }
  const skipInstall = args.includes('--skip-install');
  const positional = args.filter(arg => arg !== '--skip-install');
  if (positional.length > 1 || positional.some(arg => arg.startsWith('-'))) {
    throw new Error('Unrecognised arguments. Run create-caveat --help for usage.');
  }
  let directory = positional[0];
  if (!directory) {
    if (!process.stdin.isTTY) throw new Error('Provide a project directory. Run create-caveat --help for usage.');
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try {
      directory = (await prompt.question('Project directory (my-publication): ')).trim() || 'my-publication';
    } finally {
      prompt.close();
    }
  }
  console.log('Creating your Caveat publication…');
  const target = await createProject(directory);
  if (!skipInstall) {
    console.log('Installing dependencies…');
    const npmCli = process.env.npm_execpath;
    const command = npmCli && /npm-cli\.js$/.test(npmCli) ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const commandArgs = command === process.execPath ? [npmCli, 'ci', '--no-fund', '--no-audit'] : ['ci', '--no-fund', '--no-audit'];
    const result = spawnSync(command, commandArgs, { cwd: target, stdio: 'inherit', shell: process.platform === 'win32' && command === 'npm.cmd' });
    if (result.error || result.status !== 0) {
      console.error(`Your project is saved at ${target}, but dependency installation did not finish.\nOpen that folder, run npm install, then npm run dev.`);
      process.exitCode = 1;
      return;
    }
  }
  // Quote paths for the user's shell; no generated command is executed here.
  const quoted = process.platform === 'win32' ? `"${target}"` : `'${target.replace(/'/g, "'\\''")}'`;
  console.log(`\nYour publication is ready.\n\n  cd ${quoted}\n${skipInstall ? '  npm install\n' : ''}  npm run dev\n\nOpen http://localhost:3000 to create your owner account.\nYour private setup key will be saved in .env as CAVEAT_SETUP_KEY.\nA persistent local Prisma Postgres database starts automatically.\nConnect Resend in Settings when you are ready to send email.`);
}

main().catch(error => {
  if (error.code === 'EEXIST') {
    console.error('That path already exists. Choose a new directory; nothing was overwritten.');
  } else if (error.code === 'ENOENT') {
    console.error('Check that Git is installed and the parent directory exists.');
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});
