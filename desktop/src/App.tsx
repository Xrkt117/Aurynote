import { useCallback, useEffect, useState } from "react";
import {
  LayoutGrid,
  Headphones,
  ScanLine,
  Music2,
  Mic,
  ChartNoAxesCombined,
  ChevronRight,
  Volume2,
  X,
  HelpCircle,
  Check,
} from "lucide-react";
import { StudioContext, type Page } from "./context";
import { load, save } from "./store";
import { voice } from "./audio";
import { Brand } from "./components";
import Dashboard from "./Dashboard";
import Ear from "./Ear";
import StaffPractice from "./StaffPractice";
import Explore from "./Explore";
import PlayRoom from "./PlayRoom";
import Progress from "./Progress";
const navigation = [
  { id: "studio", name: "Your studio", icon: LayoutGrid },
  { id: "ear", name: "Ear training", icon: Headphones },
  { id: "staff", name: "Staff reading", icon: ScanLine },
  { id: "explore", name: "Scales & chords", icon: Music2 },
  { id: "play", name: "Play it back", icon: Mic },
  { id: "progress", name: "Your progress", icon: ChartNoAxesCombined },
] as const;
export default function App() {
  const [profile, setProfile] = useState(load),
    [page, setPage] = useState<Page>("studio"),
    [toast, setToast] = useState(""),
    [help, setHelp] = useState(false),
    [volume, setVolume] = useState(false);
  const notify = useCallback((message: string) => setToast(message), []);
  const go = useCallback((next: Page) => {
    voice.stop();
    setPage(next);
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    voice.volume = profile.volume;
    try {
      save(profile);
    } catch {
      setToast(
        "Progress could not be saved. Device storage may be full or blocked.",
      );
    }
  }, [profile]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelp(false);
        setVolume(false);
        voice.stop();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const key = `${profile.instrument}-${profile.written}`;
  return (
    <StudioContext.Provider value={{ profile, setProfile, go, notify }}>
      <div className="app-shell">
        <aside className="sidebar">
          <button
            className="brand-button"
            onClick={() => go("studio")}
            aria-label="aurynote home"
          >
            <Brand />
          </button>
          <div className="sidebar-caption">A SPACE TO FIND YOUR SOUND</div>
          <nav aria-label="Main navigation">
            <span className="eyebrow">PRACTICE STUDIO</span>
            {navigation.map((item) => (
              <button
                key={item.id}
                aria-current={page === item.id ? "page" : undefined}
                className={page === item.id ? "active" : ""}
                onClick={() => go(item.id)}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.id === "play" && <i className="new-dot" />}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="daily-note">
              <span className="eyebrow">A NOTE TO REMEMBER</span>
              <p>
                Musical ears are made.
                <br />
                One listen at a time.
              </p>
              <span>♩ &nbsp; ♪ &nbsp; ♫</span>
            </div>
            <button className="text-button" onClick={() => setHelp(true)}>
              <HelpCircle size={16} /> A little guidance
            </button>
            <div className="offline">
              <span className="status-dot" />
              Your practice stays on this device
            </div>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              Studio <ChevronRight size={13} />
              <strong>{navigation.find((n) => n.id === page)?.name}</strong>
            </div>
            <div className="global-controls">
              <label>
                <span>Instrument</span>
                <select
                  aria-label="Instrument"
                  value={profile.instrument}
                  onChange={(e) => {
                    voice.stop();
                    setProfile((p) => ({
                      ...p,
                      instrument: e.target.value as "piano" | "tenor",
                    }));
                  }}
                >
                  <option value="piano">Piano</option>
                  <option value="tenor">Tenor sax</option>
                </select>
              </label>
              {profile.instrument === "tenor" && (
                <label>
                  <select
                    aria-label="Pitch notation"
                    value={profile.written ? "written" : "concert"}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        written: e.target.value === "written",
                      }))
                    }
                  >
                    <option value="written">Written pitch</option>
                    <option value="concert">Concert pitch</option>
                  </select>
                </label>
              )}
              <div className="volume-wrap">
                <button
                  className="icon-button"
                  aria-label="Volume settings"
                  aria-expanded={volume}
                  onClick={() => setVolume((v) => !v)}
                >
                  <Volume2 size={18} />
                </button>
                {volume && (
                  <div className="volume-popover">
                    <label>
                      Volume · {Math.round(profile.volume * 100)}%
                      <input
                        aria-label="Volume"
                        type="range"
                        min="0"
                        max="1"
                        step=".05"
                        value={profile.volume}
                        onChange={(e) =>
                          setProfile((p) => ({
                            ...p,
                            volume: Number(e.target.value),
                          }))
                        }
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </header>
          <main key={`${page}-${key}`}>
            {page === "studio" ? (
              <Dashboard />
            ) : page === "ear" ? (
              <Ear />
            ) : page === "staff" ? (
              <StaffPractice />
            ) : page === "explore" ? (
              <Explore />
            ) : page === "play" ? (
              <PlayRoom />
            ) : (
              <Progress />
            )}
          </main>
          <footer className="app-footer">
            <Brand small />
            <span>HEAR IT. UNDERSTAND IT. PLAY IT.</span>
            <span>Made for the way you learn.</span>
          </footer>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="help-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              className="icon-button close-modal"
              aria-label="Close guidance"
              onClick={() => setHelp(false)}
            >
              <X size={20} />
            </button>
            <span className="eyebrow">WELCOME TO YOUR PRACTICE STUDIO</span>
            <h2 id="help-title">
              Start small.
              <br />
              <em>Stay curious.</em>
            </h2>
            <ol>
              <li>
                <b>Hear it.</b> Start with C and G. Listen freely, then try a
                short quiz.
              </li>
              <li>
                <b>Understand it.</b> Compare missed notes. Explore their place
                in scales and chords.
              </li>
              <li>
                <b>Play it.</b> Pick your instrument. Try matching one note with
                your microphone.
              </li>
            </ol>
            <p>
              For tenor sax, choose a concert key in the harmony library.
              Written pitch shows the notes to play on your sax. The audio
              sounds an octave and a whole step lower.
            </p>
            <p className="micro muted">
              Piano and sax voices are synthesized approximations. Progress
              saves locally; microphone audio is analyzed locally and is never
              stored. Escape stops audio.
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              <Check size={16} />
              Let's make some music
            </button>
          </section>
        </div>
      )}
    </StudioContext.Provider>
  );
}
