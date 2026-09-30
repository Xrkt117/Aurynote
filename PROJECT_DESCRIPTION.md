## Inspiration
Learning an instrument means connecting what you hear, what you read, and what you play. We wanted to bring those skills into one focused, accessible practice space.

## What it does
Aurynote is an offline desktop practice studio for beginner piano and tenor sax players. It combines guided ear training, music-reading exercises, scales and chords, microphone pitch matching, and saved progress. Tenor sax players can switch between written and concert pitch. Audio and practice history stay on the device.

## How we built it
We rebuilt an earlier Java Swing prototype using Electron, React, TypeScript, and Vite. Web Audio powers synthesized notes and local microphone analysis. Vitest checks music theory, pitch detection, and saved progress, while Playwright tests practice flows and the desktop interface.

## Challenges we ran into
Key challenges included handling tenor sax transposition with correct note spelling, detecting a steady pitch from microphone input, and keeping lesson feedback clear for beginners. Real instruments and varied microphone setups still need further testing.

## Accomplishments that we're proud of
We brought listening, reading, and playing exercises into one working desktop experience. The app provides local pitch feedback, tracks practice progress, and runs without a backend or account.

## What we learned
Music education software needs both technical accuracy and thoughtful pacing. Correct notes matter, but so do clear comparisons, time to review mistakes, and feedback that helps learners understand their next step.

## What's next for Aurynote
We plan to test pitch matching with more real instruments and microphones, expand the lessons, improve instrument sounds, and package the app for additional operating systems.
