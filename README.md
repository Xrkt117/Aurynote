# Aurynote

An offline desktop practice studio for musicians learning to hear notes, read music, and improvise.

Guided and custom ear lessons, staff reading, scales and chord symbols, microphone pitch matching, and saved progress. Choose your notes and session length, track daily goals and achievements, and listen with six synthesized instrument voices. Choose an instrument-key family with written or concert notes. Settings separates playback sound and volume from your instrument key. Audio and progress stay on your device.

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
         
# About the Project     
## Inspiration
As veteran wind instrument performers, both with experience in classical band, orchestra, and jazz, we've had an extensive interaction and progression within a musical context. Through many years, we've ranged from beginners to regional performers, and decided to channel our musical passion towards assisting younger first time musicians--to aid their process, as well as inspire new journeys. To do this, we decided to create an interactive and accessible platform, assisting in learning new scales, reading notes, etc. 

## What it does
Aurynote is an web application practice studio for beginner musicians. It combines guided ear training, music-reading exercises, scales and chords, microphone pitch matching, and saved progression. Aurynote is a complete product, showcasing all features within one platform. The product features several different tabs to organize the various modes, through a minimalist interface designed for user friendliness. Upon entering the website, you will interact with the main interface, before locating to the sidebar for said various modes, including note reading, pitch detection, and more.

## How we built it
As seen in the hackathon-overhaul branch, we rebuilt the original Java Swing application using Electron, React, TypeScript, and Vite. Web Audio handles synthesized notes for displayed pitches, as well as device microphone pitch analysis. Vitest is used for the project's music theory, pitch detection, audio synthesis, and saved progression. Playwright tests practice flows, or automated running tests, as well as microphone activation and Electron web technology. Next, we decided to convert the software into a website using github pages, and consistently worked on its functionality as a web page.

## Challenges we ran into
Key challenges included microphone detection, in terms of consistent translation into proper pitching, our design of feedback based on each mode or lesson, and microphone testing, based on quality, clarity, distance, and precision of the microphone. We overcame these issues through repeated testing, changing variable values and recording results of microphone detection, as well as consistent collaboration and communication regarding feedback and programming structure.

## Accomplishments that we're proud of
We're proud of compiling our creation, consisting of many different products, into one site. Often times, webpages and applications will be separated by each of our product's components, such as note reading, auditory scales, pitch detection, and more. Rather, we combined these various elements into one functioning completed product. We're also proud of various elements implemented that improve the quality of the experience, such as saved progression, feedback, and keyboard shortcuts.

## What we learned
We learned music software requires extensive testing, ensuring that technical accuracy is fully accurate. We also further improved our experience in programming languages, already having strong prior knowledge, yet expanding our applied skills of CSS and TypeScript, in a combined environment. 

## What's next for Aurynote
We plan to implement further testing, improving microphone detection as much as possible, with many various instruments. We also plan to expand the lessons, adding an increased progression track, and improved user feedback. Then, we will further tweak our UI, to ensure constant modernity. 

After these various changes, we plan to expand our product, including upload to a public domain, advertising, promotion, review feedback, etc.
