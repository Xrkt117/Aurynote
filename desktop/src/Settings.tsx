import { useEffect, useRef, useState } from "react";
import { X, Volume2 } from "lucide-react";
import { useStudio } from "./context";
import { voice } from "./audio";
import { sounding } from "./music";
import { tuningInfo } from "./tuning";
export default function Settings({ onClose }: { onClose: () => void }) {
  const { profile, setProfile, notify } = useStudio();
  const dialog = useRef<HTMLDialogElement>(null);
  const previous = useRef(document.activeElement as HTMLElement | null);
  const [previewing, setPreviewing] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      voice.stop();
      previous.current?.focus();
    };
  }, []);
  async function preview() {
    setPreviewing(true);
    try {
      await voice.play(
        [sounding(60, profile.tuning, profile.written)],
        profile.sound,
      );
    } catch {
      notify("Audio unavailable. Check your output device.");
    } finally {
      setPreviewing(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="settings-dialog"
      aria-labelledby="settings-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="settings-heading">
        <h2 id="settings-title">Settings</h2>
        <button
          autoFocus
          className="icon-button"
          aria-label="Close settings"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <section>
        <h3>Playback</h3>
        <p>The sound you hear is separate from your instrument key.</p>
        <label className="settings-field">
          Sound
          <select
            aria-label="Playback sound"
            value={profile.sound}
            onChange={(e) => {
              voice.stop();
              setProfile((p) => ({
                ...p,
                sound: e.target.value as "piano" | "tenor",
              }));
            }}
          >
            <option value="piano">Piano · percussive</option>
            <option value="tenor">Sax · sustained</option>
          </select>
        </label>
        <label className="settings-field">
          Volume · {Math.round(profile.volume * 100)}%
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step=".05"
            value={profile.volume}
            onChange={(e) =>
              setProfile((p) => ({ ...p, volume: Number(e.target.value) }))
            }
          />
        </label>
        <button onClick={() => void preview()} disabled={previewing}>
          <Volume2 size={16} />
          {previewing ? "Playing…" : "Preview sound"}
        </button>
      </section>
      <section>
        <h3>Notation</h3>
        <p>
          {tuningInfo(profile.tuning).key} instruments ·{" "}
          {tuningInfo(profile.tuning).examples}
        </p>
        <label className="settings-field">
          Display notes
          <select
            aria-label="Pitch notation"
            value={profile.written ? "written" : "concert"}
            onChange={(e) => {
              voice.stop();
              setProfile((p) => ({
                ...p,
                written: e.target.value === "written",
              }));
            }}
          >
            <option value="written">Written · the notes you play</option>
            <option value="concert">Concert · the notes that sound</option>
          </select>
        </label>
        <p className="micro muted">
          Changing notation or instrument key starts a fresh practice screen.
          Your saved progress stays.
        </p>
      </section>
      <button className="primary settings-done" onClick={onClose}>
        Done
      </button>
    </dialog>
  );
}
