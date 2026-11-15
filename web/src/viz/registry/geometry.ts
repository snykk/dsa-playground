/** Visualization registry: Computational geometry (points, lines and circles, segment intersection, convex hull, rotating calipers, closest pair). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
