/**
 * Scroll progress through the sequence, 0 → 1.
 *
 * Deliberately a mutable box rather than React state: this value changes on
 * every frame, and routing it through a re-render would put the whole React
 * tree in the animation loop. The scroll driver writes it; the render loop
 * reads it inside `useFrame`. Both sides import this module, so the bundler
 * hoists it into a chunk they share.
 */
export const stageProgress = { current: 0 };
