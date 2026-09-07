# caveat-create

The npm project initializer for [Caveat](https://github.com/Caveat-Newsletter/site).

This repository contains the CLI that creates a new Caveat publication project. The actual publishing application belongs in [Caveat-Newsletter/site](https://github.com/Caveat-Newsletter/site).

## Status

Development preview: `create-caveat` copies a pinned revision of the official site scaffold. That scaffold currently contains documentation only. **It does not create or deploy a working website yet.**

## Usage

Once published to npm under the `next` tag:

```sh
npm create caveat@next my-publication
```

Requires Node.js 20+, Git, and access to GitHub. Omit the directory to be prompted. Existing paths are never overwritten. The generated project does not retain the source repository's Git history.

Run locally before publication:

```sh
node bin/create-caveat.js my-publication
node bin/create-caveat.js --help
npm test
```

## Initial scope

- Implemented: ask for a directory and copy a pinned commit of the site scaffold.
- Planned when the app exists: install dependencies, explain local startup, and open the setup flow for publication details and email configuration.

The site repository is the source of truth for the application. Developer installation and guided online deployment should use the same versioned application, without maintaining separate copies of its implementation.
