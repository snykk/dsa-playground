import './IconButton.css';

const PATHS = {
  first: 'M6 5h2v14H6zM20 6 10 12l10 6z',
  prev: 'M18 6 8 12l10 6z',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  next: 'M6 6l10 6-10 6z',
  last: 'M16 5h2v14h-2zM4 6l10 6-10 6z',
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}

/** Square button with an SVG icon; the label is for screen readers. */
export function IconButton({ icon, label, onClick, disabled, primary }: Props) {
  return (
    <button type="button" className={`viz-icon${primary ? ' play' : ''}`} onClick={onClick} aria-label={label} disabled={disabled}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={PATHS[icon]} />
      </svg>
    </button>
  );
}
