#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { createProject } from '../lib/create-project.js';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const help = `Create Caveat ${version}

Usage: npm create caveat@next [directory]

Creates a new directory from a pinned version of Caveat-Newsletter/site.
Requires Node.js 20+, Git, and access to GitHub.
Existing directories are never overwritten.

DEVELOPMENT PREVIEW: the scaffold contains project documentation only.
The publishing app is not implemented yet. This does not deploy a website.

Options:
  --help, -h     Show help
  --version, -v  Show version`;

async function main() {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(help);
    return;
  }
  if (args.length === 1 && ['--version', '-v'].includes(args[0])) {
    console.log(version);
    return;
  }
  if (args.length > 1 || args.some(arg => arg.startsWith('-'))) {
    throw new Error('Unrecognised arguments. Run create-caveat --help for usage.');
  }
  let directory = args[0];
  if (!directory) {
    if (!process.stdin.isTTY) throw new Error('Provide a project directory. Run create-caveat --help for usage.');
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    try {
      directory = (await prompt.question('Project directory (my-publication): ')).trim() || 'my-publication';
    } finally {
      prompt.close();
    }
  }
  console.log('Caveat development preview: this creates documentation, not a working web app yet.');
  console.log('Downloading the official project scaffold…');
  const target = await createProject(directory);
  console.log(`Created ${target}\nOpen README.md for the current scope and project status.`);
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
