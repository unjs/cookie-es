// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: v1.1.1 (e264dfa)

import type { CookieParseOptions, Cookies, MultiCookies } from "./types.ts";
import { endIndex, eqIndex, valueSlice } from "../_utils.ts";

const NullObject = /* @__PURE__ */ (() => {
  const C = function () {};
  C.prototype = Object.create(null);
  return C;
})() as unknown as { new (): any };

/**
 * Parse a `Cookie` header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
export function parse(
  str: string,
  options: CookieParseOptions & { allowMultiple: true },
): MultiCookies;
export function parse(str: string, options?: CookieParseOptions): Cookies;
export function parse(str: string, options?: CookieParseOptions): Cookies | MultiCookies {
  const obj: MultiCookies = new NullObject();
  const len = str.length;
  // RFC 6265bis sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
  if (len < 2) return obj;

  const dec = options?.decode || decode;
  const allowMultiple = options?.allowMultiple || false;
  let index = 0;

  do {
    const eqIdx = eqIndex(str, index, len);
    if (eqIdx === -1) break; // No more cookie pairs.

    const endIdx = endIndex(str, index, len);

    if (eqIdx > endIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }

    const rawKey = valueSlice(str, index, eqIdx);
    const key = options?.decodeName ? options.decodeName(rawKey) : rawKey;

    if (options?.filter && !options.filter(key)) {
      index = endIdx + 1;
      continue;
    }

    const val = dec(valueSlice(str, eqIdx + 1, endIdx));

    if (allowMultiple) {
      const existing = obj[key];
      if (existing === undefined) {
        obj[key] = val;
      } else if (Array.isArray(existing)) {
        existing.push(val!);
      } else {
        obj[key] = [existing!, val!];
      }
    } else if (obj[key] === undefined) {
      obj[key] = val;
    }

    index = endIdx + 1;
  } while (index < len);

  return obj;
}

// --- Internal Utils ---

/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function decode(str: string): string {
  if (!str.includes("%")) return str;

  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
