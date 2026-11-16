import { hasViz } from '../viz/catalog';
import { getContent, topicsUnder } from './repo';

/**
 * Whether "visualized" markers tell the reader anything: only while some topic of the
 * repository has no visualization. Once every topic has one, a marker on each topic, area
 * and list is noise, so the components that show them ask this first.
 */
export function showVizMarkers(): boolean {
  return topicsUnder(getContent().root).some((t) => !hasViz(t.rel));
}
