# aurynote design document

Living reference for the desktop app on `hackathon-overhaul`. Current baseline: version 0.4.0. Last reviewed: September 30, 2026. The product name remains **aurynote**.

This document describes implemented behavior, its visual design, and where it is built. Update the relevant sections whenever a feature or interaction changes. Ideas are not implemented features until explicitly marked as shipped here.

## Product direction

Help musicians across instrument-key families connect hearing, notation, and playing. Beginners should always know what to do next, which note they are hearing, and whether an answer was correct. Teach relationships with a reference pitch and gradual practice; do not promise absolute pitch.

The app runs locally in Electron with React and TypeScript. It works without an account or server. The Java prototype remains on `main`; this document covers the new desktop implementation.

## Visual language

| Element | Design rule | Current implementation |
| --- | --- | --- |
| Surface | Quiet off-white canvas with white practice panels | Canvas `#f8f8f5`, white panels |
| Text | Dark primary text, readable muted supporting text | Ink `#252622`, muted `#60645d` |
| Boundaries | Thin, visible borders; restrained corners | Border token `#d1d4ca`; common button radius 6px |
| Typography | One sans-serif family with restrained selected-menu italics | Inter if available, Segoe UI/Arial fallback; italics mark the active sidebar or selected scale/chord menu item; musical notation uses symbol glyphs where required |
| Primary action | Filled dark button with a clear verb | Start, Next, playback and completion actions |
| Selection | Make the chosen mode visibly different | Dark selected navigation and segmented controls; selected pattern has a left border |
| Success | Green plus words and a check symbol | Brief “Correct!” popup with a check; solid green answer border |
| Mistake | Warm rust plus words and a different border | Dashed answer border; “Your answer”; rust feedback panel |
| Music identity | Show root, degree, note and symbol separately | Root tile, degree labels, chord symbol, keyboard markers |
| Decoration | Functional graphics only, no gradients | Playback wave, staff notation, keyboard markers, and Lucide icons |
| Motion | Short transitions that explain state changes | Subtle button transitions, playback wave, question entry, review countdown |

Maintain the monochrome foundation. Green and rust communicate meaning; they are not general decoration. Do not rely on color alone. Avoid large rounded pills, excessive shadows, ornamental font changes, promotional one-liners, long paragraphs, and unrelated visual treatments for equivalent controls.

Styles live in [style.css](../desktop/src/style.css). Shared primitives live in [components.tsx](../desktop/src/components.tsx): brand, tags, section titles, keyboard, waveform, staff, stepper, empty state, and playback button.

## App structure and global controls

[App.tsx](../desktop/src/App.tsx) owns navigation and the shared profile through [context.ts](../desktop/src/context.ts). The left sidebar contains six destinations and a compact link to saved progress. The top bar shows the current screen, a clearly labeled Instrument key selector grouped by key with instrument examples, and a text-labeled Settings button. The sidebar has no quote, note-glyph decoration, or status filler. Screen headings state the task directly. Practice screens omit decorative tip cards and footer slogans. Temporary notifications remain for errors and export status.

| Destination | Purpose | Screen source |
| --- | --- | --- |
| Your studio | Choose a next practice step | [Dashboard.tsx](../desktop/src/Dashboard.tsx) |
| Ear training | Learn and identify pitches | [Ear.tsx](../desktop/src/Ear.tsx) |
| Staff reading | Identify written notes | [StaffPractice.tsx](../desktop/src/StaffPractice.tsx) |
| Scales & chords | Hear and find playable harmony | [Explore.tsx](../desktop/src/Explore.tsx) |
| Play it back | Match a pitch on an instrument | [PlayRoom.tsx](../desktop/src/PlayRoom.tsx) |
| Your progress | Review stored practice | [Progress.tsx](../desktop/src/Progress.tsx) |

Navigation stops existing playback. Changing instrument key or notation remounts the practice screen so an old question does not continue under new settings. Changing playback sound preserves the screen. Escape closes Settings and stops sound; it is not a universal pause control outside Settings.

The desktop window starts at 1320 by 900, with an 880 by 680 minimum. CSS adapts at 1500, 1150, 900, and 650 pixels. Smaller layouts reflow cards and controls; some supplementary tips are hidden. The narrower browser layouts are supported by CSS, but the packaged desktop window retains its minimum size.

## Instrument keys and Settings

Instrument key and playback sound are independent. The compact top-bar Instrument selector groups presets by C, B♭, E♭, F, and A. Short labels such as “Tenor sax · B♭” replace full sentences inside the control; its tooltip and Settings retain the complete instrument examples. Octave variants remain distinct: choosing only a key would otherwise make tenor and trumpet microphone targets differ by an octave.

| Key | Examples in selector | Sounding pitch relative to written |
| --- | --- | --- |
| C | Piano, flute, violin, oboe | Same pitch |
| C | Guitar, double bass | 12 semitones lower |
| C | Piccolo | 12 semitones higher |
| B♭ | Trumpet, clarinet, soprano sax | 2 semitones lower |
| B♭ | Tenor sax, bass clarinet | 14 semitones lower |
| E♭ | Alto sax | 9 semitones lower |
| E♭ | Baritone sax | 21 semitones lower |
| E♭ | E♭ clarinet | 3 semitones higher |
| F | Horn, English horn | 7 semitones lower |
| A | A clarinet | 3 semitones lower |

Examples follow common modern notation conventions; instruments with alternative score conventions need the matching preset. These are notation presets, not new recorded instrument sounds. Yamaha's [saxophone guide](https://www.yamaha.com/en/musical_instrument_guide/saxophone/play/play003.html) and [clarinet guide](https://www.yamaha.com/en/musical_instrument_guide/clarinet/mechanism/mechanism005.html) explain key-based transposition.

Settings is a compact native modal dialog with two labeled sections. Playback contains six voices (Piano, Sax, Clarinet, Flute, Trumpet, Guitar), volume with percentage, and Preview sound. Notation contains Written / Concert display options and the selected instrument family. Preview plays written C4 or concert C4 according to the chosen notation; it does not alter the key. These controls save immediately.

Opening Settings stops current playback, pauses question advancement, and stops microphone input. Closing it restores keyboard focus to the invoking button. Escape, Close, Done, or a backdrop click dismiss the dialog; native modal behavior keeps Tab focus inside. Microphone input requires a new Start action afterward. Key or notation changes begin a fresh practice screen while preserving recorded progress.

The shared success popup is centered near the top of the viewport, green with a check and “Correct!” text. It does not take focus or capture clicks. A short entry/exit animation lasts 850 milliseconds; reduced-motion mode displays it without animation. Its status role announces success. Ear training and staff reading share it; microphone matching retains its steady-match state and manual next-note control.

## Practice activity calendar

[PracticeActivity.tsx](../desktop/src/PracticeActivity.tsx) adds a year of activity below the studio statistics and on Your Progress. Each saved ear, staff, or microphone answer contributes to its local calendar day. The header reports the answer total and active-day count for the last 365 days. An empty state invites the first answer; no demo activity is mixed into the profile.

The shared [GitHubCalendar](../desktop/src/components/ui/git-hub-calendar.tsx) accepts date-string/count entries and an optional color scale. Its default colors match GitHub; the app passes an olive palette. Optional today and activityLabel props support deterministic previews and practice-specific wording. It derives state from props instead of copying strings into Date-typed state. Duplicate days are summed; malformed, negative, future, and out-of-window data is excluded. Calendar dates are parsed locally to avoid UTC shifting. Real week boundaries determine month-label positions. Padding outside the rolling year is blank and noninteractive.

Each square has a dated accessible name and tooltip. A single tab stop enters the grid; arrows move by day or week, Home/End jump to the range endpoints, and the selected day's count appears below. The legend represents 0, 1, 2, 3, and 4+ answers. Small windows scroll within the calendar without widening the page. The live wrapper refreshes the date each minute while mounted. Data comes from the retained 2,000-answer history, and that limit is stated beside the chart; this is not GitHub account activity or unlimited historical tracking.

UI infrastructure now includes Tailwind v4 through the Vite plugin, TypeScript/Vite aliases, components.json, and cn(). Reusable UI components live in desktop/src/components/ui, imported through @/components/ui. The existing flat components.tsx remains for existing app primitives. Tailwind theme/utilities are loaded separately from style.css; Preflight is intentionally omitted to preserve existing styles. See [UI setup](UI_SETUP.md) for paths and CLI instructions. No image assets or new context provider are needed.

## Your studio

**Layout:** direct page heading, large next-lesson card, microphone practice card, compact statistics strip, and three practice shortcuts. The next lesson is the primary action; extra modes remain secondary. The activity calendar, daily-goal controls, and achievement grid live only on Your Progress instead of being repeated on the studio dashboard.

**Behavior:** the lesson card reflects the saved level. Its “In this lesson” preview renders the actual lesson note pool, replacing the fixed C–G wave illustration. Restrained note tiles label pitches introduced in this lesson as New and pitches from the previous lesson as Review; these are curriculum labels, not claims about the user’s mastery. A note count and new-note count summarize the preview. Tiles are informational, not playback controls. Larger pools wrap into two rows. Statistics show today's attempts against a configurable daily goal, overall saved practice accuracy, and distinct pitches correctly recognized in ear training. Goal and achievement cards display their requirements, exact counts, progress bars, and Earned / In progress states. Empty statistics use an honest empty state rather than invented activity.

**Implementation:** reads the shared profile and lesson definitions. Attempt counts come from retained history; completed sessions, discovered pitches, and passed guided lessons persist separately. The daily goal is configurable from 5 to 50 answers and counts all practice modes. It is a daily target, not a session limit.

## Ear training

**Layout:** lesson heading and question count; a pre-session setup panel with mode, lesson or note-count selector, question count, and custom note buttons; main listening panel with status, waveform, prompt, answer tiles, and keyboard; a compact practice-settings column. The three-step indicator and decorative listening-tip card have been removed. Wrong-answer feedback stays in the main panel; correct answers use the shared popup.

**Lesson progression:** C and G; C/E/G; C/D/E/G/A; seven natural notes; all twelve pitch classes. Choose any of the five guided lessons, or use custom practice with 2–12 specific notes. The note-count control expands the pool in a beginner-friendly order (C, G, E, D, A, F, B, then accidentals); individual toggles select the exact pitches. Scale-degree mode restricts custom choices to the seven C-major naturals. Choose 5, 10, 15, 20, 30, or 40 questions; the effective total is at least the selected note count so each pitch occurs once. A shuffled first pass covers the pool before missed-note weighting begins. A score of at least 80% marks that guided lesson passed and recommends the next one; custom/degree sessions do not advance the guided path.

**States and interactions:**

1. Learn: configure the pool and session length, then tap notes before beginning. Reference C and scale-degree mode are configurable here. Only selected keyboard pitches can play. Playback labels name the learning note; cancellation clears its highlight.
2. Quiz: hear a mystery note, optionally preceded by C. Scale-degree mode plays a C-major reference pattern first. Answers stay disabled during playback; Replay repeats the question.
3. Review: lock the answer, record the attempt, mark the correct tile, and identify a wrong selection separately. Incorrect answers automatically play the chosen pitch followed by the correct pitch.
4. Advance: show a non-interactive “Correct!” popup for 850 milliseconds and move straight to the next question. There is no correct-answer review panel or Pause/Next row. Incorrect answers retain 3.2 seconds of review after comparison audio finishes, with Pause, Compare again, and Next. Compare again pauses automatic advancement. Opening Settings pauses advancement until it closes.
5. Complete: show percentage, correct-answer count, distinct pool size, and pass/next-step information. A passed guided session offers “Next lesson” with the new note count; selecting it updates the local lesson immediately. “Choose notes / practice again” returns to setup; the studio also starts at the saved recommendation. Completion is counted once even if a timer and navigation action overlap. “Change practice” cancels the current question and returns to setup; previously recorded answers remain saved, but an unfinished session does not count as completed.

**Playback clarity:** live labels distinguish “Reference · C,” the home-key pattern, “Mystery note · your turn,” “Your answer,” and “Correct note.” The mystery label never reveals the answer. A short question-entry motion and updated question number mark transitions. The decorative wave indicates playback, not a measured audio waveform.

**Implementation:** the screen owns its phase, live lesson selection, queue, selected answer, pause state, and timers. The former mount-time lesson reference was removed because it kept replaying the old pool after progression. [practice.ts](../desktop/src/practice.ts) handles pool resizing, shuffling, and completion updates. Generation tokens prevent stale playback callbacks after navigation. Lesson definitions and weighted selection live in [music.ts](../desktop/src/music.ts).

## Staff reading

**Layout:** a single full-width exercise card contains a compact question toolbar, clef and challenge controls, a distinct notation stage, and a separated answer area. The current question and session score remain visible without competing with the staff. On narrow layouts, toolbar controls wrap and answer choices move to two columns. The former detached settings column and decorative clef-landmark card are removed.

**Behavior:** choose treble or bass clef, optionally include sharps/flats, and answer with four choices or typed text. Typed answers accept ordinary `#` and `b` spellings and normalize them to musical accidentals. The expected spelling must match the written note; this is a notation exercise, not an enharmonic equivalence quiz. Octave numbers are not required.

Answers lock after submission. A correct answer shows the same 850-millisecond “Correct!” popup as ear training, then advances. Wrong multiple-choice answers identify both the selected answer and correct note, retain inline feedback, and advance after 3.2 seconds. Settings pauses advancement. A listening action sits beside the answer controls and connects the displayed note to the selected instrument sound. Attempts are stored; the visible running score is local to this screen session.

**Implementation:** [StaffPractice.tsx](../desktop/src/StaffPractice.tsx), the shared SVG `Staff` component, and `staffNote` in music.ts. Timers and sound are cleaned up when leaving.

## Scales and chords

**Layout:** a visible Scales / Chords switch; concert-key selector and pattern list on the left; three numbered sections on the right:

1. Identity: scale name or chord symbol, short explanation, and transposition summary.
2. Notes to play: individual spelled note tiles with scale/chord degrees. The root has a distinct border and “Home note” label; sounding tiles show “Playing.”
3. Find the pattern: one-octave keyboard, playback, and tempo controls.

**Available scales:** major, natural minor, harmonic minor, ascending melodic minor, major pentatonic, minor pentatonic, blues, Dorian, and Mixolydian.

**Available chords:** major, minor, major seventh (Δ7), minor seventh (m7), dominant seventh (7), ninth (9), thirteenth (13), suspended fourth (sus4), suspended second (sus2), dominant ninth suspended fourth (9sus4), diminished (°), diminished seventh (°7), half-diminished (ø7), and augmented (+). The dominant thirteenth voicing omits the eleventh.

**Behavior:** all twelve concert roots are selectable. Tap a tile to hear a specific note, play the complete pattern, or stop it. All key families can hear chords together or as arpeggios. This is a listening option, not a claim that every listed instrument can play simultaneous notes. Playback sound no longer controls available harmony actions. Tempo ranges from 50 to 160 BPM; the audio engine adds separation/release, so this is a pacing control rather than a metronome-accurate rhythm exercise.

**Notation:** the selected instrument-key preset determines transposition independently of sound. Tenor written pitch is fourteen semitones above sounding pitch: concert C major is written D major. C instruments without octave transposition share written and concert pitches. The identity panel must always distinguish notes to play from the concert key. Key-specific degree spelling, including double accidentals when needed, comes from music.ts. Starting octave is displayed. Harmony roots are octave-adjusted so their written starting pitches lie between C4 and B4; this is not a full instrument-range or fingering model. The keyboard folds notes into one octave; extended chord tiles preserve their actual playback pitches.

**Implementation:** Explore.tsx renders `scales`, `chords`, and `arrangement` from music.ts. Changing root, pattern, or mode cancels playback. The keyboard plays matching pattern tones; non-pattern keys currently have no playback action.

## Play it back

**Layout:** a twelve-note target selector and random-target action sit above the target note, reference playback, microphone action, live detected pitch/tuning feedback, and success state. Input status and a compact local-audio privacy panel stay visible near the microphone controls. The former motivational instruction card is removed.

**Flow:** choose any pitch class from C4 through B4 or request a different random target, hear it, enable the microphone, and play a single steady note. Changing the target stops playback and microphone capture and clears stale feedback. Permission is requested only after user action. Denial or a missing device produces an understandable message. Stopping, succeeding, or leaving closes microphone tracks and the audio context.

**Matching rule:** the detected MIDI note must equal the sounding target and remain within 35 cents for over 650 milliseconds. The target respects the selected instrument and notation. Matching is single-note pitch detection, not chord recognition or instrument identification.

**Implementation:** PlayRoom.tsx uses `getUserMedia`, an analyser with 4096-sample frames, and `detectPitch` in audio.ts. The detector rejects quiet/ambiguous frames and searches approximately 65–1400 Hz. Electron's permission handler allows microphone requests only from the app. Audio is not recorded or uploaded.

## Your progress and storage

**Layout:** daily goal and achievement cards, headline statistics, seven-day activity chart, twelve-note practice map, and lesson journey. A first-use empty state links to practice. Export progress is a visible secondary action.

**Behavior:** show real saved attempts, accuracy, note-level results, and lesson progress. Export downloads a JSON profile. Import, cloud sync, accounts, and cross-device sharing are not implemented. Charts reflect the retained history, not an unlimited lifetime record.

**Implementation:** [store.ts](../desktop/src/store.ts) validates and persists the profile in localStorage under `aurynote.studio.v1`. The context profile setter writes each completed state transition synchronously before returning, so a fast reload or window close does not wait for a post-render effect. The profile is now version 2 and includes instrument-key preset (`tuning`), independent playback voice (`sound`), written/concert preference, volume, reference setting, lesson level, completed sessions, learned notes, error weights, and the latest 2,000 attempts. Version 1 piano preferences migrate to C/piano; tenor preferences migrate to B♭ tenor/sax. Existing attempts, lesson progress, and other preferences are retained. Version 2 now also stores customNotes, sessionLength, dailyGoal, and passedLessons with defaults for older saves. Older recommended levels imply earlier guided lessons were passed; the final lesson is not assumed passed. Custom note choices and session length persist; entering ear training defaults to the recommended guided lesson. The storage key stays unchanged so upgrades can find prior profiles. Invalid data falls back to safe defaults. Saving failures trigger a notification. Daily grouping uses local dates.

## Goals and accomplishments

[Milestones.tsx](../desktop/src/Milestones.tsx) shares the goal and achievement presentation between studio and progress. [achievements.ts](../desktop/src/achievements.ts) derives five milestones from persistent counts: first completed session, five completed sessions, five pitches recognized correctly, all twelve pitches recognized correctly, and all five guided lessons passed at 80% or higher. Repeating a passed lesson adds a session but does not add another distinct lesson. A correctly recognized pitch is a discovery, not a claim of mastery.

Each card shows the requirement, current/target counts, a progress bar, and Earned or In progress. Earned cards use a check and restrained green surface. The daily goal displays remaining answers or “Today’s goal reached.” The sidebar links its compact session/pitch summary to full progress. No decorative achievement cards appear inside a practice question.

## Sound design

[sound.ts](../desktop/src/sound.ts) generates audio samples locally. Piano uses a fast attack, decaying harmonic partials, slight detuning, and a brief hammer-like noise transient. Tenor uses a slower attack, sustained reed-like harmonics, and light breath texture. Clarinet emphasizes odd harmonics for a hollow reed sound; flute emphasizes the fundamental with gentle breath texture; trumpet uses stronger upper harmonics; guitar uses plucked partials that decay faster than piano. All six are synthesized practice voices, not recordings of real instruments.

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
| Settings dialog and shared success popup | [Settings.tsx](../desktop/src/Settings.tsx), [CorrectPopup.tsx](../desktop/src/CorrectPopup.tsx) |
| Instrument-key families and octave offsets | [tuning.ts](../desktop/src/tuning.ts) |
| Shared visual components and responsive styling | components.tsx and style.css |
| Pitch conversion, spelling, lessons and harmony definitions | music.ts |
| Voice synthesis | sound.ts |
| Playback lifecycle and pitch detection | audio.ts |
| Local data validation and persistence | store.ts |
| Music/audio behavior checks | [tests](../desktop/tests) |
| Screen, microphone and Electron flow checks | [e2e](../desktop/e2e) |
| Retained Java prototype parity | [src/aurynote](../src/aurynote) uses Preferences-backed counts, selectable pitch targets, and the revised staff exercise structure; microphone detection remains desktop-only |

## Change workflow

For every feature addition or change, update this document in the same change set:

- Describe its purpose and entry point.
- Record layout, controls, states, feedback, timing, and keyboard/accessibility behavior.
- Explain affected sound, notation, data, and permission behavior.
- Link the implementation and note relevant validation or remaining limits.
- Update existing sections instead of leaving contradictory descriptions.
- Add a short entry below. Keep proposed work separate from shipped behavior.

Verify relevant behavior and inspect changed screens. Audio changes need pitch, envelope, clipping, and playback checks; automated tests do not replace listening on real output devices. Microphone checks include simulated input, but real instruments and hardware still need field testing.

## GitHub micro-commit workflow

This is a development requirement, not an in-app feature. Make frequent, small commits as work progresses, with one meaningful change per commit. Separate independent UI, sound, behavior, test, and documentation changes when practical. Keep checkpoints coherent; avoid empty commits or arbitrary splits made only to inflate the count.

Use short, plain messages such as `Improve sax sounds` or `Label playback steps`. Stage only task-related files, perform relevant checks, and push completed commits to the active task branch. Preserve the individual commits. Hackathon development stays on `hackathon-overhaul`; changing `main`, squashing, or force-pushing requires an explicit user request. The persistent instructions are in [AGENTS.md](../AGENTS.md).

## Design history

| Version | Change |
| --- | --- |
| 0.1.0 | Introduced the desktop studio, guided lessons, staff practice, harmony library, microphone matching, and local progress. |
| 0.1.1 | Reworked instrument voices, added live listening labels, strengthened answer feedback, selected modes, and root-note distinction. |
| Documentation baseline | Established this living design reference and the repository requirement to maintain it. |
| Development workflow | Made frequent GitHub micro-commits with short messages an explicit ongoing requirement. |
| 0.2.0 | Added instrument-key families, independent sound/volume settings, fast correct popups, and a simpler screen shell. |
| 0.3.0 | Fixed session progression, added custom note pools and question counts, expanded to six sounds, restored sidebar character, and clarified daily goals and earned achievements. |
| 0.3.1 | Replaced the static C–G illustration with a lesson-aware note preview and clearly marked new pitches. |
| 0.4.0 | Added a real-data practice calendar, reusable shadcn-style UI directory, Tailwind utilities, and setup documentation. |
| 0.4.1 | Standardized the interface on one sans-serif type system, replaced promotional copy with task labels, and removed repeated or decorative dashboard and practice panels. |
| 0.4.2 | Made profile writes synchronous, added selectable pitch-matching targets, rebuilt staff reading around one focused exercise card, restored restrained selected-menu italics, and mirrored the core changes in the Java prototype. |
