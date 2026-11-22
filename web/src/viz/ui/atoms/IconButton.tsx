import type { Ref } from 'react';
import './IconButton.css';

// Filled shapes, drawn with the even-odd rule so an outline can be cut out of a shape.
const PATHS = {
  first: 'M6 5h2v14H6zM20 6 10 12l10 6z',
  prev: 'M18 6 8 12l10 6z',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  next: 'M6 6l10 6-10 6z',
  last: 'M16 5h2v14h-2zM4 6l10 6-10 6z',
  // Two open links and the bar between them.
  link: 'M10 7H7a5 5 0 0 0 0 10h3v-2H7a3 3 0 0 1 0-6h3zM14 7h3a5 5 0 0 1 0 10h-3v-2h3a3 3 0 0 0 0-6h-3zM8 11h8v2H8z',
  // A keyboard: the case cut out of a rounded block, two rows of keys and a space bar.
  keyboard:
    'M3.5 5h17A1.5 1.5 0 0 1 22 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-11A1.5 1.5 0 0 1 3.5 5zM3.75 6.75v10.5h16.5V6.75zM5.25 8.25h2.5v2.25h-2.5zM9 8.25h2.5v2.25H9zM12.75 8.25h2.5v2.25h-2.5zM16.5 8.25h2.25v2.25H16.5zM5.25 11.5h2.5v2.25h-2.5zM9 11.5h2.5v2.25H9zM12.75 11.5h2.5v2.25h-2.5zM16.5 11.5h2.25v2.25H16.5zM7.5 14.75h9v1.25h-9z',
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  /** "dialog" for a button that opens one. */
  hasPopup?: 'dialog';
  buttonRef?: Ref<HTMLButtonElement>;
}

/** Square button with an SVG icon; the label is for screen readers. */
export function IconButton({ icon, label, onClick, disabled, primary, hasPopup, buttonRef }: Props) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`viz-icon${primary ? ' play' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-haspopup={hasPopup}
      disabled={disabled}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={PATHS[icon]} fillRule="evenodd" />
      </svg>
    </button>
  );
}
