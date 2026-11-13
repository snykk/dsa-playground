import { useEffect, useState, type KeyboardEvent } from 'react';

const BASE_DELAY_MS = 900;

export interface Playback {
  index: number;
  last: number;
  playing: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
  togglePlay: () => void;
  play: () => void;
  step: (delta: number) => void;
  seek: (index: number) => void;
  reset: (to?: number) => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
}

/**
 * The player's clock: current frame, play/pause, speed and keyboard shortcuts
 * (Space play/pause, arrows step, Home/End jump). Knows nothing about algorithms.
 */
export function usePlayback(frameCount: number, initialIndex = 0): Playback {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = Math.max(0, frameCount - 1);
  const current = Math.min(index, last);

  useEffect(() => {
    if (!playing) return undefined;
    if (current >= last) {
      setPlaying(false);
      return undefined;
    }
    const id = window.setTimeout(() => setIndex((i) => Math.min(i + 1, last)), BASE_DELAY_MS / speed);
    return () => window.clearTimeout(id);
  }, [playing, current, last, speed]);

  const togglePlay = () => {
    if (!playing && current >= last) setIndex(0);
    setPlaying((p) => !p);
  };
  const step = (delta: number) => {
    setPlaying(false);
    setIndex((i) => Math.min(last, Math.max(0, Math.min(i, last) + delta)));
  };
  const seek = (i: number) => {
    setPlaying(false);
    setIndex(i);
  };
  const reset = (to = 0) => {
    setPlaying(false);
    setIndex(to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return; // fields keep their keys
    if (tag === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return; // buttons activate themselves
    if (e.key === ' ') togglePlay();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Home') step(-Infinity);
    else if (e.key === 'End') step(Infinity);
    else return;
    e.preventDefault();
  };

  return { index: current, last, playing, speed, setSpeed, togglePlay, play: () => setPlaying(true), step, seek, reset, onKeyDown };
}
