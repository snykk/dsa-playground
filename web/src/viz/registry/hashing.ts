/** Visualization registry: Hashing (hash tables, collision handling, Bloom filter, LRU / LFU caches). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
