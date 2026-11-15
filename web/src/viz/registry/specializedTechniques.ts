/** Visualization registry: Specialized techniques (square root decomposition, Mo's algorithm, heavy-light and centroid decomposition). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
