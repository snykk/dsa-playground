/** Visualization registry: Range queries (segment trees, Fenwick tree, sparse table, sqrt decomposition). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
