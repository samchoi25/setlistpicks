/*
 * Shrink individual words that are wider than their stage column.
 *
 * Artist names wrap at spaces only — words are never split mid-word — so a
 * single long word ("PINKPANTHERESS") can be wider than the column it sits in.
 * Rather than truncate it, scale that one word down until it fits. Only the
 * offending word shrinks; the rest of the name keeps the base size.
 *
 * CSS cannot express shrink-to-fit, so this measures. It runs as one batched
 * pass over the whole grid — all reads, then all writes — rather than per
 * component, to avoid layout thrash.
 *
 * A word that would have to go below MIN_SCALE to fit is left at full size and
 * allowed to ellipsize instead. Shrinking it to the floor would truncate it
 * anyway, and a clipped word at normal size reads better than a clipped word
 * at an illegible one.
 */
const MIN_SCALE = 0.62;

// Leave a hair of slack so sub-pixel rounding can't reintroduce an overflow.
const SAFETY = 0.99;

export function fitWords(root = document) {
  const words = root.querySelectorAll('.artist-name .word');
  if (!words.length) return;

  // Reset first, so a re-run after a resize measures against the base size
  // rather than compounding a previous shrink.
  for (const w of words) w.style.fontSize = '';

  // Read pass: nothing is written here, so this is a single layout flush.
  const work = [];
  for (const w of words) {
    const avail = w.clientWidth;
    const needed = w.scrollWidth;
    if (needed > avail + 0.5 && avail > 0) {
      const scale = (avail / needed) * SAFETY;
      // Below the floor, leave it alone and let CSS ellipsize at full size.
      if (scale >= MIN_SCALE) {
        work.push({ el: w, scale, basePx: parseFloat(getComputedStyle(w).fontSize) });
      }
    }
  }

  // Write pass.
  for (const { el, scale, basePx } of work) {
    el.style.fontSize = `${(basePx * scale).toFixed(2)}px`;
  }
}

/*
 * Re-fit on anything that changes column width or text metrics, and return a
 * teardown. Resizes are coalesced to one pass per frame.
 */
export function watchWordFit() {
  let queued = false;
  const run = () => {
    queued = false;
    fitWords();
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(run);
  };

  schedule();
  // Webfonts change text width after first paint.
  document.fonts?.ready.then(schedule).catch(() => {});
  window.addEventListener('resize', schedule);
  window.addEventListener('orientationchange', schedule);

  return () => {
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
  };
}
