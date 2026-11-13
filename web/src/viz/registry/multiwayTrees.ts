/** Visualization registry: Multiway and spatial trees (B-Tree, B+ Tree, interval tree, K-D tree). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
