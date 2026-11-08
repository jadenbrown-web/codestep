# CodeStep update workflow

The user requires all future updates to be stored on GitHub as well as running on the existing Sites app.

- GitHub source repository: `https://github.com/jadenbrown-web/codestep` (remote `github`, branch `main`).
- Sites deployment mirror: the existing Sites repository at remote `origin`.
- Live app: `https://codestep-learn-code.jadenbrown.chatgpt.site`.
- Preserve `.openai/hosting.json` project identity and the existing audience.
- Every authorized update must be committed and pushed to GitHub before publishing it to Sites. Push the exact same commit to the Sites mirror before saving/deploying a version.
- Read existing changes before editing. Never commit credentials, `.env` files, generated build archives, or TypeScript build caches.
- Use the connected GitHub tools or the authenticated GitHub CLI for GitHub operations. Never use a Sites credential for a GitHub push.
- Run `npm test` and the relevant browser checks with `npm run test:browser`. GitHub Actions must pass for the pushed commit.
- Package and publish through the Sites workflow; do not replace hosting with GitHub Pages, which cannot run this Worker app.
- GitHub CI validates and builds the app; Sites publishing remains a separate step. Do not claim a GitHub push automatically deployed the website.
