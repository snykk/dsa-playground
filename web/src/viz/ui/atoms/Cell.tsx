import type { Role } from '../../core/types';
import '../roles.css';
import { SYM } from '../symbols';
import './Cell.css';

export interface CellProps {
  value?: string | number | null;
  role?: Role;
  /** "index" = small column label, "blank" = invisible spacer used for alignment. */
  variant?: 'index' | 'blank';
  wide?: boolean;
  pointer?: boolean;
  erased?: boolean;
  /** Underline that marks the parity region of a codeword. */
  parity?: boolean;
  title?: string;
}

/** One square cell (character, number or byte). Status roles get a check/cross glyph. */
export function Cell({ value, role, variant, wide, pointer, erased, parity, title }: CellProps) {
  const classes = ['cell', wide && 'wide', variant, role && `role-${role}`, parity && 'region-parity', erased && 'erased', pointer && 'pointer']
    .filter(Boolean)
    .join(' ');
  const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
  return (
    <span className={classes} title={title}>
      {value ?? ''}
      {glyph && (
        <span className="cell-glyph" aria-hidden="true">
          {glyph}
        </span>
      )}
    </span>
  );
}
