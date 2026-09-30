# aurynote design document

Living reference for the desktop app on `hackathon-overhaul`. Current baseline: version 0.1.1. Last reviewed: September 29, 2026. The product name remains **aurynote**.

This document describes implemented behavior, its visual design, and where it is built. Update the relevant sections whenever a feature or interaction changes. Ideas are not implemented features until explicitly marked as shipped here.

## Product direction

Help piano and tenor sax players connect hearing, notation, and playing. Beginners should always know what to do next, which note they are hearing, and whether an answer was correct. Teach relationships with a reference pitch and gradual practice; do not promise absolute pitch.

The app runs locally in Electron with React and TypeScript. It works without an account or server. The Java prototype remains on `main`; this document covers the new desktop implementation.

## Visual language

| Element | Design rule | Current implementation |
| --- | --- | --- |
| Surface | Quiet off-white canvas with white practice panels | Canvas `#f8f8f5`, white panels |
| Text | Dark primary text, readable muted supporting text | Ink `#252622`, muted `#60645d` |
| Boundaries | Thin, visible borders; restrained corners | Border token `#d1d4ca`; common button radius 6px |
| Typography | Sans-serif controls with occasional serif emphasis | Inter if available, Segoe UI/Arial fallback; Georgia/Times for serif |
| Primary action | Filled dark button with a clear verb | Start, Next, playback and completion actions |
| Selection | Make the chosen mode visibly different | Dark selected navigation and segmented controls; selected pattern has a left border |
| Success | Green plus words and a check symbol | Solid green answer border; “Correct note”; green feedback panel |
| Mistake | Warm rust plus words and a different border | Dashed answer border; “Your answer”; rust feedback panel |
| Music identity | Show root, degree, note and symbol separately | Root tile, degree labels, chord symbol, keyboard markers |
| Decoration | Sparse musical details, no gradients | Wave mark, note glyphs, line illustrations, Lucide icons |
| Motion | Short transitions that explain state changes | Subtle button transitions, playback wave, question entry, review countdown |

Maintain the monochrome foundation. Green and rust communicate meaning; they are not general decoration. Do not rely on color alone. Avoid large rounded pills, excessive shadows, long paragraphs, and unrelated visual treatments for equivalent controls.

Styles live in [style.css](../desktop/src/style.css). Shared primitives live in [components.tsx](../desktop/src/components.tsx): brand, tags, section titles, keyboard, waveform, staff, stepper, empty state, and playback button.

## App structure and global controls

[App.tsx](../desktop/src/App.tsx) owns navigation and the shared profile through [context.ts](../desktop/src/context.ts). The left sidebar contains six destinations. The top bar shows the current location, instrument, notation where applicable, and volume. A help dialog, temporary notifications, and a quiet footer support the main content.

| Destination | Purpose | Screen source |
| --- | --- | --- |
| Your studio | Choose a next practice step | [Dashboard.tsx](../desktop/src/Dashboard.tsx) |
| Ear training | Learn and identify pitches | [Ear.tsx](../desktop/src/Ear.tsx) |
| Staff reading | Identify written notes | [StaffPractice.tsx](../desktop/src/StaffPractice.tsx) |
| Scales & chords | Hear and find playable harmony | [Explore.tsx](../desktop/src/Explore.tsx) |
| Play it back | Match a pitch on an instrument | [PlayRoom.tsx](../desktop/src/PlayRoom.tsx) |
| Your progress | Review stored practice | [Progress.tsx](../desktop/src/Progress.tsx) |

Navigation stops existing playback. Changing instrument or notation remounts the practice screen so an old question does not continue under new settings. Escape closes help/volume overlays and stops sound; it is not a universal pause control for question timers.

The desktop window starts at 1320 by 900, with an 880 by 680 minimum. CSS adapts at 1500, 1150, 900, and 650 pixels. Smaller layouts reflow cards and controls; some supplementary tips are hidden. The narrower browser layouts are supported by CSS, but the packaged desktop window retains its minimum size.

## Your studio

**Layout:** editorial heading, large next-lesson card, microphone practice card, compact statistics strip, and three practice shortcuts. The next lesson is the primary action; extra modes remain secondary.

**Behavior:** the lesson card reflects the saved level. Statistics show today's attempts against a ten-question goal, overall saved accuracy, and distinct pitches correctly recognized in ear training. Empty statistics use an honest empty state rather than invented activity.

**Implementation:** reads the shared profile and lesson definitions. All counts come from saved attempts; the daily goal is a display target, not a session limit.

## Ear training

**Layout:** lesson heading and question count; a three-step Learn / Recognize / Reflect indicator; main listening panel with status, waveform, prompt, answer tiles, and keyboard; supporting tip/settings column. Feedback and review actions stay inside the main panel.

**Lesson progression:** C and G; C/E/G; C/D/E/G/A; seven natural notes; all twelve pitch classes. A session contains at least ten questions, or twice the note-pool size when larger. A score of at least 80% unlocks the next guided lesson. Missed notes receive more weight in later selection.

**States and interactions:**

1. Learn: tap notes before beginning. Reference C and scale-degree mode are configurable here.
2. Quiz: hear a mystery note, optionally preceded by C. Scale-degree mode plays a C-major reference pattern first. Answers stay disabled during playback; Replay repeats the question.
3. Review: lock the answer, record the attempt, mark the correct tile, and identify a wrong selection separately. Incorrect answers automatically play the chosen pitch followed by the correct pitch.
4. Advance: allow 1.4 seconds after a correct answer or 3.2 seconds after an incorrect one, once comparison audio has finished. Pause, Compare again, and Next provide control. Compare again pauses automatic advancement.
5. Complete: show actual score, answer-history dots, unlock information, and actions to return or practice again.

**Playback clarity:** live labels distinguish “Reference · C,” the home-key pattern, “Mystery note · your turn,” “Your answer,” and “Correct note.” The mystery label never reveals the answer. A short question-entry motion and updated question number mark transitions. The decorative wave indicates playback, not a measured audio waveform.

**Implementation:** the screen owns its phase, queue, selected answer, pause state, and timers. Generation tokens prevent stale playback callbacks after navigation. Lesson definitions and weighted selection live in [music.ts](../desktop/src/music.ts).

## Staff reading

**Layout:** large SVG staff, prominent note-identification prompt, answer controls, current question number and session score. Treble/bass selection belongs next to the staff. Supporting settings and reading tips are separate from the answer area.

**Behavior:** choose treble or bass clef, optionally include sharps/flats, and answer with four choices or typed text. Typed answers accept ordinary `#` and `b` spellings and normalize them to musical accidentals. The expected spelling must match the written note; this is a notation exercise, not an enharmonic equivalence quiz. Octave numbers are not required.

Answers lock after submission, show feedback, and advance after 1.4 seconds when correct or 3.2 seconds when wrong. A listening action connects the displayed note to the selected instrument sound. Attempts are stored; the visible running score is local to this screen session.

**Implementation:** [StaffPractice.tsx](../desktop/src/StaffPractice.tsx), the shared SVG `Staff` component, and `staffNote` in music.ts. Timers and sound are cleaned up when leaving.

## Scales and chords

**Layout:** a visible Scales / Chords switch; concert-key selector and pattern list on the left; three numbered sections on the right:

1. Identity: scale name or chord symbol, short explanation, and transposition summary.
2. Notes to play: individual spelled note tiles with scale/chord degrees. The root has a distinct border and “Home note” label; sounding tiles show “Playing.”
3. Find the pattern: one-octave keyboard, playback, and tempo controls.

**Available scales:** major, natural minor, harmonic minor, ascending melodic minor, major pentatonic, minor pentatonic, blues, Dorian, and Mixolydian.

**Available chords:** major, minor, major seventh (Δ7), minor seventh (m7), dominant seventh (7), ninth (9), thirteenth (13), suspended fourth (sus4), suspended second (sus2), dominant ninth suspended fourth (9sus4), diminished (°), diminished seventh (°7), half-diminished (ø7), and augmented (+). The dominant thirteenth voicing omits the eleventh.

**Behavior:** all twelve concert roots are selectable. Tap a tile to hear a specific note, play the complete pattern, or stop it. Piano chords also offer simultaneous playback. Tenor chord tones play as arpeggios. Tempo ranges from 50 to 160 BPM; the audio engine adds separation/release, so this is a pacing control rather than a metronome-accurate rhythm exercise.

**Notation:** piano uses concert pitch. Tenor written pitch is fourteen semitones above sounding pitch: concert C major is written D major. The identity panel must always distinguish notes to play from the concert key. Key-specific degree spelling, including double accidentals when needed, comes from music.ts. Starting octave is displayed. The keyboard folds notes into one octave; extended chord tiles preserve their actual playback pitches.

**Implementation:** Explore.tsx renders `scales`, `chords`, and `arrangement` from music.ts. Changing root, pattern, or mode cancels playback. The keyboard plays matching pattern tones; non-pattern keys currently have no playback action.

## Play it back

**Layout:** target note and reference playback, a clear microphone action, live detected pitch/tuning feedback, and success state. Input status and local-audio privacy text stay visible near the microphone controls.

**Flow:** hear the target, enable the microphone, play a single steady note, then advance after matching. Permission is requested only after user action. Denial or a missing device produces an understandable message. Stopping, succeeding, or leaving closes microphone tracks and the audio context.

**Matching rule:** the detected MIDI note must equal the sounding target and remain within 35 cents for over 650 milliseconds. The target respects the selected instrument and notation. Matching is single-note pitch detection, not chord recognition or instrument identification.

**Implementation:** PlayRoom.tsx uses `getUserMedia`, an analyser with 4096-sample frames, and `detectPitch` in audio.ts. The detector rejects quiet/ambiguous frames and searches approximately 65–1400 Hz. Electron's permission handler allows microphone requests only from the app. Audio is not recorded or uploaded.

## Your progress and storage

**Layout:** headline statistics, seven-day activity chart, twelve-note practice map, and lesson journey. A first-use empty state links to practice. Export progress is a visible secondary action.

**Behavior:** show real saved attempts, accuracy, note-level results, and lesson progress. Export downloads a JSON profile. Import, cloud sync, accounts, and cross-device sharing are not implemented. Charts reflect the retained history, not an unlimited lifetime record.

**Implementation:** [store.ts](../desktop/src/store.ts) validates and persists the profile in localStorage under `aurynote.studio.v1`. It includes instrument, written/concert preference, volume, reference setting, lesson level, completed sessions, learned notes, error weights, and the latest 2,000 attempts. Invalid data falls back to safe defaults. Saving failures trigger a notification. Daily grouping uses local dates.

## Sound design

[sound.ts](../desktop/src/sound.ts) generates audio samples locally. Piano uses a fast attack, decaying harmonic partials, slight detuning, and a brief hammer-like noise transient. Tenor uses a slower attack, sustained reed-like harmonics, and light breath texture. Both are synthesized practice voices, not recordings of real instruments.

[audio.ts](../desktop/src/audio.ts) schedules buffers on the Web Audio clock, applies volume, reduces simultaneous-note gain, and tracks sources. Stop fades sources over roughly 15 milliseconds instead of cutting them abruptly. Sequential starts are separated by the requested duration plus 260 milliseconds; piano and sax have different release tails. Playback callbacks drive note highlights and labels. Sound cancellation must prevent stale visual updates as well as stop audio.

Do not add reverb, detuning, or expressive modulation that makes the target pitch harder to identify without testing the effect. Keep comparable loudness between notes and instruments, clear note boundaries, and headroom for chords.

## Accessibility and interaction rules

Use real buttons, labels, visible keyboard focus, and descriptive accessible names. Preserve reduced-motion styles. Use text and symbols alongside color for answers and microphone state. Keep selected modes distinguishable from hover and disabled controls. Announce playback/feedback through status regions without revealing a quiz answer early.

Existing support includes focus styles, status messages, labeled controls, SVG descriptions, and reduced-motion handling. A complete screen-reader audit and modal focus-management audit have not been completed; do not describe the app as fully accessibility-certified.

## Implementation boundaries

| Responsibility | Source |
| --- | --- |
| Desktop window, navigation restrictions, microphone permissions | [electron/main.cjs](../desktop/electron/main.cjs) |
| Screen navigation, global controls, profile context | App.tsx and context.ts |
| Shared visual components and responsive styling | components.tsx and style.css |
| Pitch conversion, spelling, lessons and harmony definitions | music.ts |
| Voice synthesis | sound.ts |
| Playback lifecycle and pitch detection | audio.ts |
| Local data validation and persistence | store.ts |
| Music/audio behavior checks | [tests](../desktop/tests) |
| Screen, microphone and Electron flow checks | [e2e](../desktop/e2e) |

## Change workflow

For every feature addition or change, update this document in the same change set:

- Describe its purpose and entry point.
- Record layout, controls, states, feedback, timing, and keyboard/accessibility behavior.
- Explain affected sound, notation, data, and permission behavior.
- Link the implementation and note relevant validation or remaining limits.
- Update existing sections instead of leaving contradictory descriptions.
- Add a short entry below. Keep proposed work separate from shipped behavior.

Verify relevant behavior and inspect changed screens. Audio changes need pitch, envelope, clipping, and playback checks; automated tests do not replace listening on real output devices. Microphone checks include simulated input, but real instruments and hardware still need field testing.

## Design history

| Version | Change |
| --- | --- |
| 0.1.0 | Introduced the desktop studio, guided lessons, staff practice, harmony library, microphone matching, and local progress. |
| 0.1.1 | Reworked instrument voices, added live listening labels, strengthened answer feedback, selected modes, and root-note distinction. |
| Documentation baseline | Established this living design reference and the repository requirement to maintain it. |
