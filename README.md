# aurynote

An offline desktop practice studio for piano and tenor sax players learning to hear notes, read music, and improvise.

Guided ear lessons, staff reading, scales and chord symbols, microphone pitch matching, and saved progress. Tenor sax supports written and concert pitch with correctly spelled notes. Audio and progress stay on your device.

This branch is the Electron, React, and TypeScript overhaul. The original Java app is on `main`; its source is retained here for reference.

## Run

Use Node.js 22.12 or newer:

```sh
cd desktop
npm ci
npm start
```

Create a Windows portable app with `npm run package`. Open the resulting `.exe` in `desktop/release` without installing Java or Node.

## Check

Run `npm test` for music and pitch detection checks. Run `npm run build`, then `npx playwright install chromium` and `npm run test:ui` for screen, microphone, and desktop tests.

See [the demo guide](docs/HACKATHON.md) for the walkthrough and limitations.

See the [design document](docs/DESIGN.md) for features, UI rules, and implementation details.
