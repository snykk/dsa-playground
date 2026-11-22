/** Geometry for a horizontally scrolling row (the algorithm tabs on a phone). */

export interface RowGeometry {
  /** Current scroll offset of the row. */
  scrollLeft: number;
  /** Visible width of the row. */
  viewWidth: number;
  /** Full width of its content (scrollWidth). */
  contentWidth: number;
  /** The item's offset and width inside the row. */
  itemLeft: number;
  itemWidth: number;
  /** Room to keep between the item and either edge, where the "more" hints sit. */
  margin: number;
}

/**
 * The smallest scroll that shows the whole item with `margin` to spare: an item already in view
 * leaves the row where it is, one cut off at an edge is brought just inside it. An item too
 * wide for both margins is centred (the hints then cover only its padding), and one wider than
 * the view shows its start. Always clamped to the row's scroll range, so the first and last
 * items reach the very ends.
 */
export function scrollLeftToShow(g: RowGeometry): number {
  const max = Math.max(0, g.contentWidth - g.viewWidth);
  let left = g.scrollLeft;
  if (g.itemWidth >= g.viewWidth) left = g.itemLeft;
  else if (g.itemWidth + 2 * g.margin > g.viewWidth) left = g.itemLeft - (g.viewWidth - g.itemWidth) / 2;
  else if (g.itemLeft + g.itemWidth + g.margin > left + g.viewWidth) left = g.itemLeft + g.itemWidth + g.margin - g.viewWidth;
  else if (g.itemLeft - g.margin < left) left = g.itemLeft - g.margin;
  return Math.min(max, Math.max(0, Math.round(left)));
}

/** Which ends of a row hide content, with a pixel of slack for fractional scroll offsets. */
export function hiddenEnds(scrollLeft: number, viewWidth: number, contentWidth: number): { before: boolean; after: boolean } {
  const max = contentWidth - viewWidth;
  return { before: max > 1 && scrollLeft > 1, after: max > 1 && scrollLeft < max - 1 };
}
