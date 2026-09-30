import { writtenOffset, tuningInfo } from "./tuning";
import { useEffect, useRef, useState } from "react";
import { Play, Square, ArrowRight, Info } from "lucide-react";
import { useStudio } from "./context";
import {
  arrangement,
  notes,
  scales,
  chords,
  noteName,
  octaveName,
} from "./music";
import { voice } from "./audio";
import { Piano, Tag } from "./components";
export default function Explore() {
  const { profile, notify } = useStudio();
  const [kind, setKind] = useState<"scales" | "chords">("scales"),
    [root, setRoot] = useState(0),
    [index, setIndex] = useState(0),
    [active, setActive] = useState<number[]>([]),
    [busy, setBusy] = useState(false),
    [bpm, setBpm] = useState(90);
  const token = useRef(0);
  const collection = kind === "scales" ? scales : chords,
    pattern = collection[index] || collection[0],
    tones = arrangement(root, pattern, profile.tuning, profile.written),
    displayRoot = tones[0].midi % 12;
  function stop() {
    token.current++;
    voice.stop();
    setActive([]);
    setBusy(false);
  }
  useEffect(
    () => () => {
      token.current++;
      voice.stop();
    },
    [],
  );
  useEffect(() => {
    stop();
  }, [kind, root, index]);
  async function play(together = false, one?: number) {
    stop();
    const epoch = token.current;
    setBusy(true);
    try {
      await voice.play(
        one !== undefined ? [tones[one].sound] : tones.map((n) => n.sound),
        profile.sound,
        (n) => {
          if (epoch === token.current)
            setActive(
              n === null
                ? []
                : together
                  ? tones.map((t) => t.midi)
                  : [n + writtenOffset(profile.tuning, profile.written)],
            );
        },
        together,
        60 / bpm,
      );
    } catch {
      notify("Audio unavailable. Check your output device.");
    } finally {
      if (epoch === token.current) {
        setBusy(false);
        setActive([]);
      }
    }
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE HARMONY LIBRARY</span>
          <h1>
            A vocabulary for
            <br />
            <em>your next idea.</em>
          </h1>
          <p>See the pattern. Hear the color. Find it on your instrument.</p>
        </div>
        <div className="segmented large">
          <button
            aria-pressed={kind === "scales"}
            className={kind === "scales" ? "selected" : ""}
            onClick={() => {
              setKind("scales");
              setIndex(0);
            }}
          >
            Scales
          </button>
          <button
            aria-pressed={kind === "chords"}
            className={kind === "chords" ? "selected" : ""}
            onClick={() => {
              setKind("chords");
              setIndex(0);
            }}
          >
            Chords
          </button>
        </div>
      </div>
      <div className="explore-layout">
        <aside className="pattern-list">
          <label className="eyebrow" htmlFor="concert-key">
            CONCERT KEY
          </label>
          <select
            id="concert-key"
            value={root}
            onChange={(e) => setRoot(Number(e.target.value))}
          >
            {notes.map((n, i) => (
              <option value={i} key={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="eyebrow list-label">
            {kind === "scales" ? "CHOOSE A SCALE" : "CHOOSE A CHORD"}
          </span>
          {collection.map((p, i) => (
            <button
              key={p.name}
              aria-pressed={i === index}
              className={i === index ? "selected" : ""}
              onClick={() => setIndex(i)}
            >
              <span>{p.name}</span>
              {kind === "chords" ? (
                <b>{p.symbol || "maj"}</b>
              ) : (
                <ArrowRight size={14} />
              )}
            </button>
          ))}
        </aside>
        <div className="harmony-content">
          <section className="panel harmony-identity">
            <div className="panel-top">
              <span className="eyebrow">
                01 / THE {kind === "scales" ? "SCALE" : "CHORD"}
              </span>
              <Tag>{tones.length} tones</Tag>
            </div>
            <div className="harmony-title">
              <h2>
                {noteName(displayRoot)}
                {kind === "chords" ? (
                  <span>{pattern.symbol}</span>
                ) : (
                  <em> {pattern.name.toLowerCase()}</em>
                )}
              </h2>
              <p>{pattern.description}</p>
            </div>
            <div className="transposition">
              <span>
                {writtenOffset(profile.tuning, profile.written) !== 0
                  ? `${tuningInfo(profile.tuning).key} INSTRUMENT · WRITTEN NOTES`
                  : "CONCERT NOTES"}
              </span>
              <strong>
                {noteName(displayRoot)}{" "}
                {kind === "scales" ? pattern.name.toLowerCase() : pattern.name}
              </strong>
              <ArrowRight size={17} />
              <span>sounds in</span>
              <strong>{noteName(root)}</strong>
              <small>Start on {octaveName(tones[0].midi)}</small>
            </div>
          </section>
          <section className="panel tone-panel">
            <div className="panel-top">
              <span className="eyebrow">02 / NOTES TO PLAY</span>
              <span className="micro muted">Tap a note to hear it</span>
            </div>
            <div className="tone-grid">
              {tones.map((tone, i) => (
                <button
                  key={i}
                  onClick={() => void play(false, i)}
                  className={`${active.includes(tone.midi) ? "active" : ""} ${i === 0 ? "root-tone" : ""}`}
                >
                  <small>
                    {tone.degree === "1" ? "ROOT" : `DEGREE ${tone.degree}`}
                  </small>
                  <strong>{tone.name}</strong>
                  <span>
                    {active.includes(tone.midi)
                      ? "♪ Playing"
                      : i === 0
                        ? "Home note"
                        : `Step ${tone.degree}`}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className="panel keyboard-panel">
            <div className="panel-top">
              <span className="eyebrow">03 / FIND THE PATTERN</span>
              <span className="micro muted">Root marked 1 · one octave</span>
            </div>
            <Piano
              active={active}
              pool={tones.map((n) => n.midi)}
              root={displayRoot}
              onPlay={(n) => {
                const i = tones.findIndex((t) => t.midi % 12 === n);
                if (i >= 0) void play(false, i);
              }}
            />
            <div className="playback-bar">
              <button
                className="primary"
                onClick={() => (busy ? stop() : void play(false))}
              >
                {busy ? (
                  <Square size={15} />
                ) : (
                  <Play size={15} fill="currentColor" />
                )}
                {busy ? "Stop" : "Play the pattern"}
              </button>
              {kind === "chords" && (
                <button onClick={() => void play(true)}>Hear together</button>
              )}
              <label className="tempo">
                Tempo{" "}
                <input
                  aria-label="Playback tempo"
                  type="range"
                  min="50"
                  max="160"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                />
                <span>{bpm} BPM</span>
              </label>
            </div>
          </section>
          <p className="micro muted harmony-note">
            <Info size={14} />
            {
              "The instrument key controls notation. Playback sound is chosen separately in Settings."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
