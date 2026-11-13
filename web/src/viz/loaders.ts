/**
 * Code-split loaders: a page only downloads the visualizations it shows.
 * Each area registers its loaders next to its catalog entries (src/viz/registry);
 * catalog.test.ts checks that every catalog id has exactly one loader.
 */
import { REGISTRIES } from './catalog';
import type { AnyVizSpec } from './core/types';

export const VIZ_LOADERS: Record<string, () => Promise<AnyVizSpec>> = Object.assign({}, ...REGISTRIES.map((r) => r.loaders));
