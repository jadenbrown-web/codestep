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
- Preserve the Sites app and also build the standalone browser app for GitHub Pages with `npm run build:pages`. GitHub Pages must use the standalone static artifact, not the Worker build.
- Keep the GitHub source repository private. The user has authorized a public standalone website and automatic Pages deployment. Never change repository visibility to enable Pages. GitHub Pages for a private repository requires an eligible GitHub plan; if activation is blocked, report the actual setting or permission required.
- GitHub CI validates both builds and deploys the standalone app through Pages after checks pass. Sites hosting remains separate; preserve its current audience. Verify the live URL before claiming Pages is running.
