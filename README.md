# caveat-create

The npm project initializer for [Caveat](https://github.com/CaveatJS/site).

Create a working publication with article pages, a local Markdown editor, and RSS. The application source lives in [CaveatJS/site](https://github.com/CaveatJS/site).

## Status

`0.1.0-alpha.1` includes a runnable Next.js application. The earlier `alpha.0` release copied documentation only; use the current `next` release or an explicit version.

## Usage

```sh
npm create caveat@next my-publication
cd my-publication
npm run dev
```

Open **http://localhost:3000** for the website and **http://localhost:3000/studio** for the editor. If that port is busy, use the address printed in the terminal.

Requires Node.js 20.9+, Git, and access to GitHub and npm. Omit the directory to be prompted. Dependencies install automatically; pass `--skip-install` to install them yourself later. Existing paths are never overwritten. The generated project does not retain the source repository's Git history.

Posts are saved to Markdown files in `content/posts`. The browser editor runs locally in development; production builds serve the publication with the editor disabled. Email, subscriber management, and a hosted editor are not included yet.

Run locally before publication:

```sh
node bin/create-caveat.js my-publication
node bin/create-caveat.js --help
npm test
```

## Initial scope

- Ask for a directory and copy a pinned, verified version of the site app.
- Install dependencies and print the website and editor startup instructions.
- Preserve the project and explain recovery if dependency installation fails.

The site repository is the source of truth for the application. Developer installation and guided online deployment should use the same versioned application, without maintaining separate copies of its implementation.
