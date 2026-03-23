// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: v1.1.1 (e264dfa)

import type { CookieParseOptions, Cookies, MultiCookies, SetCookie } from "./types.ts";

/**
 * RegExp to match max-age-value in RFC 6265 sec 5.6.2
 */
const maxAgeRegExp = /^-?\d+$/;

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
  // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
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

    const key = valueSlice(str, index, eqIdx);

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

/**
 * Deserialize a `Set-Cookie` header into an object.
 */
export function parseSetCookie(str: string, options?: CookieParseOptions): SetCookie {
  const dec = options?.decode || decode;
  const len = str.length;
  const _endIdx = endIndex(str, 0, len);
  const eqIdx = eqIndex(str, 0, _endIdx);
  const setCookie: SetCookie =
    eqIdx === -1
      ? { name: "", value: dec(valueSlice(str, 0, _endIdx)) }
      : {
          name: valueSlice(str, 0, eqIdx),
          value: dec(valueSlice(str, eqIdx + 1, _endIdx)),
        };

  let index = _endIdx + 1;
  while (index < len) {
    const endIdx = endIndex(str, index, len);
    const eqIdx = eqIndex(str, index, endIdx);
    const attr = eqIdx === -1 ? valueSlice(str, index, endIdx) : valueSlice(str, index, eqIdx);
    const val = eqIdx === -1 ? undefined : valueSlice(str, eqIdx + 1, endIdx);

    switch (attr.toLowerCase()) {
      case "httponly": {
        setCookie.httpOnly = true;
        break;
      }
      case "secure": {
        setCookie.secure = true;
        break;
      }
      case "partitioned": {
        setCookie.partitioned = true;
        break;
      }
      case "domain": {
        setCookie.domain = val;
        break;
      }
      case "path": {
        setCookie.path = val;
        break;
      }
      case "max-age": {
        if (val && maxAgeRegExp.test(val)) setCookie.maxAge = Number(val);
        break;
      }
      case "expires": {
        if (!val) break;
        const date = new Date(val);
        if (Number.isFinite(date.valueOf())) setCookie.expires = date;
        break;
      }
      case "priority": {
        if (!val) break;
        const priority = val.toLowerCase();
        if (priority === "low" || priority === "medium" || priority === "high") {
          setCookie.priority = priority;
        }
        break;
      }
      case "samesite": {
        if (!val) break;
        const sameSite = val.toLowerCase();
        if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
          setCookie.sameSite = sameSite;
        }
        break;
      }
    }

    index = endIdx + 1;
  }

  return setCookie;
}

// --- Internal Utils ---

/**
 * Find the `;` character between `min` and `len` in str.
 */
function endIndex(str: string, min: number, len: number) {
  const index = str.indexOf(";", min);
  return index === -1 ? len : index;
}

/**
 * Find the `=` character between `min` and `max` in str.
 */
function eqIndex(str: string, min: number, max: number) {
  const index = str.indexOf("=", min);
  return index < max ? index : -1;
}

/**
 * Slice out a value between start to max.
 */
function valueSlice(str: string, min: number, max: number) {
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
