# Repository instructions

## Design documentation

Read `docs/DESIGN.md` before changing product features, screens, interactions, sound, notation, or persistence in the desktop app.

Whenever adding, changing, or removing a feature, update the relevant sections of `docs/DESIGN.md` in the same change set. Include the user-facing behavior, layout and controls, states and feedback, accessibility considerations, implementation files, and relevant limitations. Add a short design-history entry for meaningful feature changes. Document shipped behavior accurately; label proposals as unimplemented.

Keep the README short and link to the design document for detail. Preserve aurynote's restrained visual style, simple code comments, and small commits with short plain messages. Do not include unrelated user files in commits.

## GitHub micro-commits

Make frequent, small, meaningful commits as work progresses. Split independent changes into separate commits whenever practical; do not batch an entire feature overhaul into one commit. Each commit should describe one clear change and leave a coherent checkpoint. Do not create empty or artificial commits just to increase the count.

Use short, plain commit messages, such as `Improve sax sounds`, `Clarify answer feedback`, or `Update design notes`. Avoid long descriptions and generated attribution trailers.

Stage only files belonging to the current change. Run relevant checks before publishing and push completed commits to the active task branch on GitHub. Keep hackathon work on `hackathon-overhaul`; do not push it to `main`, squash the micro-commit history, or force-push unless the user explicitly requests that.

Preserve commit signing when it is configured. Do not disable signing to bypass a key or passphrase error; resolve the signing issue before committing.
