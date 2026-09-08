# create-caveat

The npm initializer for [Caveat](https://github.com/CaveatJS/site): a newsletter website, browser editor, subscriber management, and email delivery on infrastructure you own.

## Start writing

```sh
npm create caveat@latest my-newsletter
cd my-newsletter
npm run dev
```

Both @latest and @next install this full application release.

Requires Node.js 22.12+, Git, and access to GitHub and npm. Dependencies install automatically. The first dev run starts a persistent local Prisma Postgres database and saves a private setup key in `.env`. Open the website, enter that key, create your owner account, and name your publication.

Write and publish locally without cloud accounts. Connect Resend in Settings when you want email delivery. Deploy the same application to your own Vercel project with the Prisma Postgres integration. Deployment and owner recovery instructions are included in the generated project.

## Behaviour

- Downloads the pinned application commit from `CaveatJS/site`.
- Checks that the app, Prisma schema, startup script, and lockfile exist.
- Removes Git history from the generated project.
- Refuses to overwrite an existing directory.
- Preserves the project if dependency installation fails.
- Supports `--skip-install`, `--help`, and `--version`.

The database-backed editor replaces the alpha releases’ development-only Markdown editor. Existing alpha publications should retain their Markdown content before upgrading; automatic content migration is not included.

## Maintainers

Update `revision` in `lib/create-project.js` after the application commit passes its database, browser, and production-build checks. Run `npm test`, `npm pack --dry-run`, and a fresh installation before publishing. Never include npm credentials or application secrets in the package.
