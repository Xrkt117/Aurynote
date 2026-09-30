import type { ReactNode } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { mod, noteName, staffNote } from "./music";
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? "small" : ""}`}>
      <span className="brand-mark">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path
            d="M3 16c3 0 3-10 6-10s3 14 6 14 3-10 8-10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span>
        aurynote<span className="brand-dot">.</span>
      </span>
    </div>
  );
}
export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}
export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
export function Piano({
  active = [],
  pool = [],
  root,
  onPlay,
  compact = false,
  onlyPool = false,
}: {
  active?: number[];
  pool?: number[];
  root?: number;
  onPlay?: (n: number) => void;
  compact?: boolean;
  onlyPool?: boolean;
}) {
  const white = [0, 2, 4, 5, 7, 9, 11],
    black = [
      { n: 1, x: 1 },
      { n: 3, x: 2 },
      { n: 6, x: 4 },
      { n: 8, x: 5 },
      { n: 10, x: 6 },
    ];
  const key = (n: number, isBlack = false, x = 0) => (
    <button
      key={n}
      type="button"
      aria-label={`Play ${noteName(n)}`}
      disabled={!onPlay || (onlyPool && !pool.some((v) => mod(v) === n))}
      onClick={() => onPlay?.(n)}
      className={`piano-key ${isBlack ? "black" : "white"} ${active.some((v) => mod(v) === n) ? "sounding" : ""} ${pool.some((v) => mod(v) === n) ? "in-scale" : ""}`}
      style={isBlack ? { left: `${(x / 7) * 100}%` } : undefined}
    >
      <span className="key-marker">
        {root !== undefined && mod(root) === n ? "1" : "•"}
      </span>
      <span>{noteName(n)}</span>
    </button>
  );
  return (
    <div
      className={`piano ${compact ? "compact" : ""}`}
      aria-label="One-octave keyboard"
    >
      <div className="white-keys">{white.map((n) => key(n))}</div>
      {black.map(({ n, x }) => key(n, true, x))}
    </div>
  );
}
export function Wave({ playing = false }: { playing?: boolean }) {
  return (
    <div className={`wave ${playing ? "playing" : ""}`} aria-hidden="true">
      {Array.from({ length: 43 }, (_, i) => (
        <i
          key={i}
          style={{
            height: `${8 + Math.abs(Math.sin(i * 0.68)) * Math.sin(((i + 1) / 44) * Math.PI) * 54}px`,
            animationDelay: `${i * 0.034}s`,
          }}
        />
      ))}
    </div>
  );
}
export function Staff({
  step,
  accidental = 0,
  bass = false,
  notes,
}: {
  step: number;
  accidental?: number;
  bass?: boolean;
  notes?: number[];
}) {
  const bottom = bass ? 18 : 30;
  return (
    <svg
      className="staff"
      viewBox="0 0 560 200"
      role="img"
      aria-label={`${bass ? "Bass" : "Treble"} clef note to identify`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="25"
          x2="535"
          y1={138 - i * 18}
          y2={138 - i * 18}
          stroke="currentColor"
          strokeWidth="1"
          opacity=".65"
        />
      ))}
      <text
        x="36"
        y={bass ? 127 : 144}
        fontSize="90"
        fontFamily="Segoe UI Symbol,serif"
      >
        {bass ? "𝄢" : "𝄞"}
      </text>
      {(notes || [step]).map((s, i) => {
        const relative = s - bottom,
          y = 138 - relative * 9,
          x = notes ? 145 + i * 44 : 300;
        return (
          <g key={i}>
            {Array.from({ length: 15 }, (_, j) => j * 2 - 8)
              .filter(
                (n) => (n < 0 && n >= relative) || (n > 8 && n <= relative),
              )
              .map((n) => (
                <line
                  key={n}
                  x1={x - 18}
                  x2={x + 18}
                  y1={138 - n * 9}
                  y2={138 - n * 9}
                  stroke="currentColor"
                />
              ))}
            {accidental !== 0 && (
              <text x={x - 35} y={y + 7} fontSize="28">
                {accidental > 0 ? "♯" : "♭"}
              </text>
            )}
            <ellipse
              cx={x}
              cy={y}
              rx="10"
              ry="6.5"
              transform={`rotate(-20 ${x} ${y})`}
              fill="currentColor"
            />
            <line
              x1={x + (relative < 4 ? 9 : -9)}
              x2={x + (relative < 4 ? 9 : -9)}
              y1={y}
              y2={y + (relative < 4 ? -48 : 48)}
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </g>
        );
      })}
    </svg>
  );
}
export function Stepper({ stage }: { stage: number }) {
  return (
    <div className="stepper">
      {["Listen & learn", "Recognize", "Reflect"].map((name, i) => (
        <span
          key={name}
          className={stage === i ? "current" : stage > i ? "done" : ""}
        >
          <b>{String(i + 1).padStart(2, "0")}</b>
          {name}
          {i < 2 && <i />}
        </span>
      ))}
    </div>
  );
}
export function Empty({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: () => void;
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{copy}</p>
      {action && (
        <button className="primary" onClick={action}>
          Start listening <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
export function PlayButton({
  onClick,
  disabled = false,
  children = "Listen",
}: {
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <button className="primary" onClick={onClick} disabled={disabled}>
      <Play size={16} fill="currentColor" />
      {children}
    </button>
  );
}
export const naturalSteps = Array.from({ length: 13 }, (_, i) =>
  staffNote(28 + i),
);
