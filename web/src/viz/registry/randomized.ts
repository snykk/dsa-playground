/** Visualization registry: Randomized algorithms (randomized quickselect, reservoir sampling). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
