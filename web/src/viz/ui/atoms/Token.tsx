import type { Role } from '../../core/types';
import '../roles.css';
import './Token.css';

/** One item of a strip: a queue entry, a stack frame, a packed item... */
export function Token({ text, role }: { text: string; role?: Role }) {
  return <span className={`viz-token${role ? ` role-${role}` : ''}`}>{text}</span>;
}
