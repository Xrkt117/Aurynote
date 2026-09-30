import { useCallback, useEffect, useState } from "react";
import {
  LayoutGrid,
  Headphones,
  ScanLine,
  Music2,
  Mic,
  ChartNoAxesCombined,
  Settings2,
  X,
} from "lucide-react";
import { StudioContext, type Page } from "./context";
import { load, save } from "./store";
import { voice } from "./audio";
import { Brand } from "./components";
import { tunings, tuningInfo, type Tuning } from "./tuning";
import Settings from "./Settings";
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
    [settings, setSettings] = useState(false);
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
      notify("Progress could not be saved. Check device storage.");
    }
  }, [profile, notify]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") voice.stop();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  return (
    <StudioContext.Provider
      value={{ profile, setProfile, go, notify, settingsOpen: settings }}
    >
      <div className="app-shell">
        <aside className="sidebar">
          <button
            className="brand-button"
            onClick={() => go("studio")}
            aria-label="aurynote home"
          >
            <Brand />
          </button>
          <nav aria-label="Main navigation">
            {navigation.map((item) => (
              <button
                key={item.id}
                aria-current={page === item.id ? "page" : undefined}
                className={page === item.id ? "active" : ""}
                onClick={() => go(item.id)}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <button
              className="sidebar-accomplishments"
              onClick={() => go("progress")}
            >
              <strong>View progress</strong>
              <span>
                {profile.completed} sessions · {profile.learned.length} of 12
                pitches
              </span>
            </button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <strong className="current-page">
              {navigation.find((n) => n.id === page)?.name}
            </strong>
            <div className="global-controls">
              <label className="key-select">
                <span>Instrument</span>
                <select
                  aria-label="Instrument key"
                  title={tuningInfo(profile.tuning).examples}
                  value={profile.tuning}
                  onChange={(e) => {
                    voice.stop();
                    setProfile((p) => ({
                      ...p,
                      tuning: e.target.value as Tuning,
                    }));
                  }}
                >
                  {[...new Set(tunings.map((t) => t.key))].map((key) => (
                    <optgroup key={key} label={`${key} instruments`}>
                      {tunings
                        .filter((t) => t.key === key)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {
                              (
                                {
                                  c: "Piano / flute",
                                  "c-low": "Guitar / bass",
                                  "c-high": "Piccolo",
                                  bb: "Trumpet / clarinet",
                                  tenor: "Tenor sax",
                                  eb: "Alto sax",
                                  baritone: "Baritone sax",
                                  "eb-high": "E♭ clarinet",
                                  f: "Horn / English horn",
                                  a: "A clarinet",
                                } as const
                              )[t.id]
                            }{" "}
                            · {t.key}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <button
                className="settings-trigger"
                onClick={() => {
                  voice.stop();
                  setSettings(true);
                }}
              >
                <Settings2 size={18} />
                Settings
              </button>
            </div>
          </header>
          <main key={`${page}-${profile.tuning}-${profile.written}`}>
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
      {settings && <Settings onClose={() => setSettings(false)} />}
    </StudioContext.Provider>
  );
}
