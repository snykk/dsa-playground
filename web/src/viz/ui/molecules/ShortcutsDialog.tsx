import { useEffect, useRef } from 'react';
import { shortcutGroups } from '../keys';
import './ShortcutsDialog.css';

interface Props {
  id: string;
  open: boolean;
  /** Called once the dialog has closed (Escape, the close button or a click outside it). */
  onClose: () => void;
  hasTabs: boolean;
  hasInput: boolean;
}

/**
 * The player's keyboard shortcuts in a modal dialog, listed from the same table the key
 * handlers use. A native <dialog>: it keeps focus inside while open and closes on Escape;
 * the Player puts focus back where it was.
 */
export function ShortcutsDialog({ id, open, onClose, hasTabs, hasInput }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const close = () => {
    const dialog = ref.current;
    if (dialog && typeof dialog.close === 'function') dialog.close();
    else onClose();
  };

  return (
    <dialog
      ref={ref}
      className="viz-shortcuts"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      // Keys typed here are not player shortcuts (the dialog sits inside the player).
      onKeyDown={(e) => e.stopPropagation()}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="viz-shortcuts-sheet">
        <div className="viz-shortcuts-head">
          <h2 id={`${id}-title`}>Keyboard shortcuts</h2>
          <button type="button" className="viz-btn" onClick={close}>
            Close
          </button>
        </div>
        <p className="viz-shortcuts-note">The player keys work while the player has focus: click its drawing or tab to it.</p>
        {shortcutGroups(hasTabs, hasInput).map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <dl>
              {group.rows.map((row) => (
                <div key={row.does} className="viz-shortcuts-row">
                  <dt>
                    {row.keys.map((k, i) => (
                      <span key={k.name}>
                        {i > 0 && <span className="viz-shortcuts-or"> or </span>}
                        <kbd>
                          <span aria-hidden="true">{k.cap}</span>
                          <span className="visually-hidden">{k.name}</span>
                        </kbd>
                      </span>
                    ))}
                  </dt>
                  <dd>{row.does}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  );
}
