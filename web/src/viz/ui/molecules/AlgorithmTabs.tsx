import './AlgorithmTabs.css';

interface Props {
  titles: string[];
  active: number;
  onSelect: (index: number) => void;
}

/** Tabs to switch between algorithms that share one player (e.g. all sorting algorithms). */
export function AlgorithmTabs({ titles, active, onSelect }: Props) {
  return (
    <div className="viz-tabs" role="tablist" aria-label="Algorithm">
      {titles.map((title, i) => (
        <button
          key={title}
          type="button"
          role="tab"
          aria-selected={i === active}
          className={i === active ? 'selected' : undefined}
          onClick={() => onSelect(i)}
          onKeyDown={(e) => {
            const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!delta) return;
            e.preventDefault();
            e.stopPropagation(); // arrows here switch tabs instead of stepping the animation
            onSelect((active + delta + titles.length) % titles.length);
          }}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
