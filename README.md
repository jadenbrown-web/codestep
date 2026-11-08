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

GitHub is the permanent source repository. Every future change must be committed and pushed here. The existing Sites source repository remains a deployment mirror because the live app is hosted by Sites, not GitHub Pages.

For each update:

1. Run the regression and relevant browser checks.
2. Commit and push the source to the `github` remote.
3. Push the same commit to the Sites source remote (`origin`).
4. Package the build and publish it through Sites. Preserve the project ID in `.openai/hosting.json` and the app’s existing access settings.
5. Verify the GitHub workflow and Sites deployment succeeded.

GitHub Actions validates builds; it does not independently publish to Sites. Do not store Sites credentials in this repository. Sites publishing uses short-lived credentials supplied at publishing time.

The source includes language logos and WebAssembly parsing grammars under `public/`; keep their bundled licence/source notices with them.
