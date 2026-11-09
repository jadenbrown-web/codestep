# CodeStep

Learn JavaScript, C#, C++, Python, HTML and CSS by typing real code, building code blocks, and checking the results.

- Live app: https://codestep-learn-code.jadenbrown.chatgpt.site
- Source: https://github.com/jadenbrown-web/codestep

The app uses React, TypeScript and Vinext, with a Cloudflare Worker production build. Phone and desktop layouts share the same lessons and breakdowns. Progress, preferences and pinned lessons are saved in the browser.

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by the development server.

## Check and build

```sh
npm test
npx playwright install chromium
npm run test:browser
```

`npm test` builds the production app and runs the regression tests, including a request to the built Worker and checks that all six language assets ship. Browser checks cover phone layouts, inline code highlighting, pin states, header alignment and scrollbar consistency in light and dark themes.

GitHub Actions runs these checks on every push to `main` and every pull request, and saves the production build as an artifact.

To run the built app locally:

```sh
npm run build
npm start
```

## Future updates and hosting

GitHub is the permanent source repository. Every future update must be committed and pushed here. The existing Sites source repository remains a deployment mirror.

There are two builds from the same React components and lessons:

- `npm run build`: the existing Sites Worker app.
- `npm run build:pages`: an independent static browser app in `pages-dist/`. It needs no Sites server or ChatGPT login. Language logos, examples, and WebAssembly code-checking grammars are bundled locally. Progress stays in the browser on each origin.

The GitHub Actions workflow checks the app and builds both outputs. After checks pass on `main`, it publishes the standalone build to GitHub Pages. The website may be public while this source repository stays private. Visitors can inspect the browser JavaScript, HTML and CSS, but cannot edit the repository or deployed app without repository access. Never put secrets in browser code.

To activate hosting, open repository **Settings → Pages** and select **GitHub Actions** as the source. GitHub requires an eligible plan to publish Pages from a private repository. Do not make the repository public to bypass that restriction. After activation, rerun the CodeStep checks workflow. The expected URL is `https://jadenbrown-web.github.io/codestep/`; it is live only after a successful Pages deployment and URL verification.

The existing Sites audience stays unchanged. Progress is stored separately in each browser/origin.

For another project path, set `CODESTEP_BASE_PATH` when building; its default is `/codestep/`.

For each update:

1. Run `npm test`, `npm run test:browser`, and `npm run test:pages`.
2. Commit and push the source to the `github` remote; verify Actions.
3. Push the same commit to the Sites source remote (`origin`).
4. Package and publish through Sites, preserving `.openai/hosting.json` and existing access settings.
5. Verify the live build assets, not just the deployment status.

Do not store Sites credentials in GitHub. Sites publishing uses short-lived credentials supplied at publishing time.

The source includes language logos and WebAssembly parsing grammars under `public/`; keep their bundled licence/source notices with them.
