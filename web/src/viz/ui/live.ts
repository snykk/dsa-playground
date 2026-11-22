/**
 * When the player's caption is a live region. Stepping by hand, each new caption is read out
 * (polite); while the player runs by itself (playing, or a teaser that plays on its own) the
 * region is off, so a screen reader is not handed a caption every fraction of a second. This
 * follows the WAI-ARIA carousel pattern for content that advances automatically.
 */
export function captionLive(playing: boolean, autoplay: boolean): 'off' | 'polite' {
  return playing || autoplay ? 'off' : 'polite';
}
