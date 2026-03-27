/**
 * RFC 6265bis cookie-age-limit: 400 days in seconds.
 */
export const COOKIE_MAX_AGE_LIMIT = 34560000; // 400 * 24 * 60 * 60

/**
 * Find the `;` character between `min` and `len` in str.
 */
export function endIndex(str: string, min: number, len: number) {
  const index = str.indexOf(";", min);
  return index === -1 ? len : index;
}

/**
 * Find the `=` character between `min` and `max` in str.
 */
export function eqIndex(str: string, min: number, max: number) {
  const index = str.indexOf("=", min);
  return index < max ? index : -1;
}

/**
 * Slice out a value between start to max.
 */
export function valueSlice(str: string, min: number, max: number) {
  if (min === max) return "";
  let start = min;
  let end = max;

  do {
    // eslint-disable-next-line unicorn/prefer-code-point
    const code = str.charCodeAt(start);
    if (code !== 32 /*   */ && code !== 9 /* \t */) break;
  } while (++start < end);

  while (end > start) {
    // eslint-disable-next-line unicorn/prefer-code-point
    const code = str.charCodeAt(end - 1);
    if (code !== 32 /*   */ && code !== 9 /* \t */) break;
    end--;
  }

  return str.slice(start, end);
}
