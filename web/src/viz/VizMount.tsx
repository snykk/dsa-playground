import { useEffect, useState } from 'react';
import { Player } from './core/Player';
import type { AnyVizSpec } from './core/types';
import { VIZ_LOADERS } from './loaders';

/** Client island: loads the requested visualization specs, then hands them to the Player. */
export default function VizMount({ ids }: { ids: string[] }) {
  const [specs, setSpecs] = useState<AnyVizSpec[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    let alive = true;
    const missing = ids.filter((id) => !VIZ_LOADERS[id]);
    if (missing.length) {
      setError(`No visualization registered for: ${missing.join(', ')}`);
      return undefined;
    }
    Promise.all(ids.map((id) => VIZ_LOADERS[id]()))
      .then((loaded) => alive && setSpecs(loaded))
      .catch((e: unknown) => alive && setError(`Could not load the visualization (${String(e)}).`));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (error) return <p className="viz-load-error">{error}</p>;
  if (!specs) return <div className="viz-loading">Loading visualization&#x2026;</div>;
  return <Player specs={specs} />;
}
