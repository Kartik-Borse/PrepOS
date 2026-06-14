import { useState, useEffect } from 'react';
import './DSAVisualizer.css';

interface Props {
  patternType: string;
  input: string;
}

interface Frame {
  arr: string[];
  left: number;
  right: number;
  highlight: number[];
  map: Record<string, number>;
  maxLen: number;
  label: string;
}

function buildSlidingWindowFrames(s: string): Frame[] {
  const frames: Frame[] = [];
  const arr = s.replace(/"/g, '').split('');
  const map: Record<string, number> = {};
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < arr.length; right++) {
    const ch = arr[right];
    if (map[ch] !== undefined && map[ch] >= left) {
      frames.push({
        arr: [...arr],
        left,
        right,
        highlight: [map[ch]],
        map: { ...map },
        maxLen,
        label: `Duplicate '${ch}' found at index ${map[ch]}. Move left to ${map[ch] + 1}`,
      });
      left = map[ch] + 1;
    }
    map[ch] = right;
    maxLen = Math.max(maxLen, right - left + 1);
    frames.push({
      arr: [...arr],
      left,
      right,
      highlight: [],
      map: { ...map },
      maxLen,
      label: `Window [${left}..${right}] = "${arr.slice(left, right + 1).join('')}" | length=${right - left + 1} | max=${maxLen}`,
    });
  }
  return frames;
}

export default function DSAVisualizer({ patternType, input }: Props) {
  const s = input.replace(/"/g, '') || 'abcabcbb';
  const frames = buildSlidingWindowFrames(s);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (frame >= frames.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setFrame((f) => f + 1), 700);
    return () => clearTimeout(t);
  }, [playing, frame, frames.length]);

  const cur = frames[frame] ?? frames[0];
  if (!cur) return null;

  return (
    <div className="visualizer">
      <div className="vis-header">
        <h2>DSA Visualizer</h2>
        <span className="vis-pattern">{patternType.replace(/-/g, ' ')}</span>
      </div>

      <div className="vis-input-row">
        <span className="vis-label">Input: </span>
        <code>s = "{s}"</code>
      </div>

      {/* Character array */}
      <div className="vis-array-wrap">
        <div className="vis-array">
          {cur.arr.map((ch, i) => {
            const isLeft = i === cur.left;
            const isRight = i === cur.right;
            const inWindow = i >= cur.left && i <= cur.right;
            const isDup = cur.highlight.includes(i);
            return (
              <div key={i} className={`vis-cell ${inWindow ? 'in-window' : ''} ${isDup ? 'duplicate' : ''} ${isLeft ? 'is-left' : ''} ${isRight ? 'is-right' : ''}`}>
                <span className="vis-char">{ch}</span>
                <span className="vis-idx">{i}</span>
                {isLeft && <div className="vis-pointer left-ptr">L</div>}
                {isRight && <div className="vis-pointer right-ptr">R</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="vis-status">
        <div className="vis-stat"><span>Left</span><strong>{cur.left}</strong></div>
        <div className="vis-stat"><span>Right</span><strong>{cur.right}</strong></div>
        <div className="vis-stat"><span>Window</span><strong>{cur.right - cur.left + 1}</strong></div>
        <div className="vis-stat max"><span>Max</span><strong>{cur.maxLen}</strong></div>
      </div>

      <div className="vis-label-text">{cur.label}</div>

      {/* HashMap */}
      <div className="vis-hashmap">
        <div className="vis-hashmap-title">HashMap (char → last index)</div>
        <div className="vis-map-entries">
          {Object.entries(cur.map).map(([k, v]) => (
            <div key={k} className="vis-entry">
              <span className="ve-key">'{k}'</span>
              <span className="ve-arrow">→</span>
              <span className="ve-val">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="vis-controls">
        <button onClick={() => { setPlaying(false); setFrame(0); }} disabled={frame === 0} className="vis-btn">⏮</button>
        <button onClick={() => setFrame((f) => Math.max(0, f - 1))} disabled={frame === 0} className="vis-btn">◀</button>
        <button onClick={() => setPlaying(!playing)} className="vis-btn play">{playing ? '⏸' : '▶'}</button>
        <button onClick={() => setFrame((f) => Math.min(frames.length - 1, f + 1))} disabled={frame >= frames.length - 1} className="vis-btn">▶</button>
        <button onClick={() => { setPlaying(false); setFrame(frames.length - 1); }} disabled={frame >= frames.length - 1} className="vis-btn">⏭</button>
        <span className="vis-progress">{frame + 1} / {frames.length}</span>
      </div>
    </div>
  );
}
