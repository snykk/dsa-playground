import type { Role } from '../../core/types';
import '../roles.css';
import './Swatch.css';

/** The color square used in legends (outlined for the neutral "idle" role). */
export function Swatch({ role }: { role: Role }) {
  return <span className={`viz-swatch role-${role}`} aria-hidden="true" />;
}
