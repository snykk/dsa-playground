import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { tabKeyTarget } from '../keys';
import { hiddenEnds, scrollLeftToShow } from '../scroll';
import './AlgorithmTabs.css';

interface Props {
  titles: string[];
  active: number;
  onSelect: (index: number) => void;
  /** Prefix for the tab ids (`<idBase>-tab-<i>`), which the panel's aria-labelledby names. */
  idBase: string;
  /** Id of the element the tabs switch (the rest of the player). */
  panelId: string;
}

/** Room kept between the selected tab and an edge, wider than the "more" arrow there. */
const EDGE_ROOM = 44;

const CHEVRON = { before: 'M14.5 6 8.5 12l6 6', after: 'M9.5 6l6 6-6 6' } as const;

/**
 * Tabs to switch between algorithms that share one player (e.g. all sorting algorithms).
 * Wide players wrap the tabs; on a phone they stay one row that scrolls sideways, with an
 * arrow over each end that hides tabs, and the selected tab is kept in view. Keyboard: the
 * ARIA tabs pattern with a roving tab stop (arrows, Home, End; see TAB_KEYS in ../keys).
 */
export function AlgorithmTabs({ titles, active, onSelect, idBase, panelId }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  const reducedMotion = useReducedMotion();
  const [more, setMore] = useState({ before: false, after: false });

  // Which ends hide tabs; follows scrolling, resizing and font loading.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;
    const update = () => {
      const next = hiddenEnds(list.scrollLeft, list.clientWidth, list.scrollWidth);
      setMore((m) => (m.before === next.before && m.after === next.after ? m : next));
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : undefined;
    observer?.observe(list);
    if (!observer) window.addEventListener('resize', update);
    return () => {
      list.removeEventListener('scroll', update);
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', update);
    };
  }, [titles.length]);

  // Keep the selected tab in view: placed at once on the first render, then scrolled smoothly.
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.children[active] as HTMLElement | undefined;
    if (!list || !tab) return;
    const left = scrollLeftToShow({
      scrollLeft: list.scrollLeft,
      viewWidth: list.clientWidth,
      contentWidth: list.scrollWidth,
      itemLeft: tab.offsetLeft,
      itemWidth: tab.offsetWidth,
      margin: EDGE_ROOM,
    });
    if (Math.abs(left - list.scrollLeft) >= 1) {
      list.scrollTo({ left, behavior: placed.current && !reducedMotion ? 'smooth' : 'auto' });
    }
    placed.current = true;
  }, [active, reducedMotion]);

  const page = (direction: 1 | -1) => {
    const list = listRef.current;
    list?.scrollBy({ left: direction * Math.max(80, list.clientWidth - 2 * EDGE_ROOM), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="viz-tabs-wrap">
      <div ref={listRef} className="viz-tabs" role="tablist" aria-label="Algorithm">
        {titles.map((title, i) => (
          <button
            key={title}
            id={`${idBase}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={panelId}
            tabIndex={i === active ? 0 : -1}
            className={i === active ? 'selected' : undefined}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              const next = tabKeyTarget(e.key, i, titles.length);
              if (next === undefined || e.altKey || e.ctrlKey || e.metaKey) return;
              e.preventDefault();
              e.stopPropagation(); // arrows, Home and End here switch tabs instead of stepping the animation
              onSelect(next);
              // The effect above scrolls the row; focusing must not jump the page as well.
              (listRef.current?.children[next] as HTMLElement | undefined)?.focus({ preventScroll: true });
            }}
          >
            {title}
          </button>
        ))}
      </div>
      {(['before', 'after'] as const).map(
        (end) =>
          more[end] && (
            // A pointer shortcut only: keyboard users have the arrow keys, and the tab list
            // itself tells screen readers how many tabs there are.
            <button
              key={end}
              type="button"
              className={`viz-tabs-more ${end}`}
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => page(end === 'before' ? -1 : 1)}
            >
              <svg viewBox="0 0 24 24">
                <path d={CHEVRON[end]} />
              </svg>
            </button>
          ),
      )}
    </div>
  );
}
