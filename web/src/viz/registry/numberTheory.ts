/** Visualization registry: Number theory (Euclid, modular arithmetic and exponentiation, Miller-Rabin, the Chinese remainder theorem, the sieve). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {};
