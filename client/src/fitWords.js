/*
 * Shrink individual words that are wider than their stage column.
 *
 * Artist names wrap at spaces only — words are never split mid-word — so a long
 * word can be wider than the column it sits in. Where the name has other words
 * to sit alongside, scaling that one word down is barely noticeable: the rest of
 * the title holds the base size and sets the reference.
 *
 * A name that is a single word is left alone and allowed to ellipsize instead.
 * There is nothing beside it at full size, so shrinking rescales the whole
 * title and it reads as a different size from every neighbouring block.
 *
 * CSS cannot express shrink-to-fit, so this measures. It runs as one batched
 * pass over the whole grid — all reads, then all writes — rather than per
 * component, to avoid layout thrash.
 *
 * A word that would have to go below MIN_SCALE to fit is also left at full size.
 * Shrinking it that far would truncate it anyway, and a clipped word at normal
 * size reads better than a clipped word at an illegible one.
 */
const MIN_SCALE = 0.62;

// Leave a hair of slack so sub-pixel rounding can't reintroduce an overflow.
const SAFETY = 0.99;

export function fitWords(root = document) {
  const words = [...root.querySelectorAll('.artist-name .word')];
  if (!words.length) return;

  /*
   * Measure the word's own natural width against the width of the name box
   * around it, rather than comparing the word's scrollWidth to its
   * clientWidth. Those words sit inside a `display: -webkit-box` (which
   * -webkit-line-clamp requires), and a percentage max-width on a child of a
   * legacy -webkit-box is not reliably honoured — WebKit may leave the word
   * unclamped, in which case scrollWidth equals clientWidth and an overflow
   * looks like a fit. Measuring the element itself avoids depending on that.
   *
   * Batched as write → read → write so the whole grid costs a fixed number of
   * layout flushes instead of one per word.
   */

  // Reset previous sizing (so a re-run measures the base size rather than
  // compounding a shrink) and lift the cap so the natural width is visible.
  for (const w of words) {
    w.style.fontSize = '';
    w.style.maxWidth = 'none';
  }

  const measured = words.map((w) => ({
    el: w,
    natural: w.getBoundingClientRect().width,
    avail: w.parentElement.clientWidth,
    basePx: parseFloat(getComputedStyle(w).fontSize),
    // A one-word name has nothing beside it to anchor the size against.
    soleWord: w.parentElement.querySelectorAll('.word').length === 1,
  }));

  for (const { el, natural, avail, basePx, soleWord } of measured) {
    el.style.maxWidth = '';
    if (!(avail > 0) || natural <= avail + 0.5) continue;

    const scale = (avail / natural) * SAFETY;
    if (scale >= MIN_SCALE && !soleWord) {
      el.style.fontSize = `${(basePx * scale).toFixed(2)}px`;
    } else {
      // Either a one-word name, or too long to shrink legibly — ellipsize at
      // full size. Pin an explicit pixel max-width: unlike the stylesheet's
      // percentage, a length clamps in every engine, so the ellipsis is
      // guaranteed rather than the word spilling out of its column.
      el.style.maxWidth = `${Math.floor(avail)}px`;
    }
  }
}

/*
 * Re-fit on anything that changes column width or text metrics, and return a
 * teardown. Resizes are coalesced to one pass per frame.
 */
export function watchWordFit() {
  let queued = false;
  const run = () => {
    if (!queued) return;
    queued = false;
    fitWords();
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(run);
    // A hidden tab never paints, so requestAnimationFrame does not fire there.
    // Without this a grid first rendered in a background tab stays unsized —
    // every over-wide word ellipsized — until something triggers a resize.
    // Timers still run while hidden; `queued` means whichever fires first wins.
    setTimeout(run, 200);
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
