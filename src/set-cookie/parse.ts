// Based on https://github.com/nfriedly/set-cookie-parser (MIT) and https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>

import type { SetCookie, SetCookieParseOptions } from "./types.ts";
import { COOKIE_MAX_AGE_LIMIT } from "../_utils.ts";

/**
 * RegExp to match max-age-value in RFC 6265 sec 5.6.2
 */
const maxAgeRegExp = /^-?\d+$/;
const _nullProto = Object.getPrototypeOf({}) as Record<string, unknown>;

/**
 * Parse a [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header string into an object.
 */
export function parseSetCookie(
  str: string,
  options?: SetCookieParseOptions,
): SetCookie | undefined {
  const len = str.length;

  // Find first ; and = in name-value pair
  let _endIdx = len;
  let eqIdx = -1;
  for (let i = 0; i < len; i++) {
    const c = str.charCodeAt(i);
    if (c === 0x3b /* ; */) {
      _endIdx = i;
      break;
    }
    if (c === 0x3d /* = */ && eqIdx === -1) {
      eqIdx = i;
    }
  }
  if (eqIdx >= _endIdx) eqIdx = -1;

  const name = eqIdx === -1 ? "" : _trim(str, 0, eqIdx);
  if (name && name in _nullProto) return undefined;

  let value = eqIdx === -1 ? _trim(str, 0, _endIdx) : _trim(str, eqIdx + 1, _endIdx);

  if (!name && !value) return undefined;

  // RFC 6265bis sec 5.6 step 5: reject if name+value exceeds 4096 octets
  if (name.length + value.length > 4096) return undefined;

  if (options?.decode !== false) {
    value = _decode(value, options?.decode);
  }

  const setCookie: SetCookie = { name, value };

  let index = _endIdx + 1;
  while (index < len) {
    // Find next ; and = for this attribute
    let endIdx = len;
    let attrEqIdx = -1;
    for (let i = index; i < len; i++) {
      const c = str.charCodeAt(i);
      if (c === 0x3b /* ; */) {
        endIdx = i;
        break;
      }
      if (c === 0x3d /* = */ && attrEqIdx === -1) {
        attrEqIdx = i;
      }
    }
    if (attrEqIdx >= endIdx) attrEqIdx = -1;

    const attr = attrEqIdx === -1 ? _trim(str, index, endIdx) : _trim(str, index, attrEqIdx);
    const val = attrEqIdx === -1 ? undefined : _trim(str, attrEqIdx + 1, endIdx);

    // RFC 6265bis sec 5.6: ignore attribute values exceeding 1024 octets
    if (val === undefined || val.length <= 1024) {
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
          // RFC 6265bis sec 5.6.3: strip leading dot and lowercase
          if (val) {
            setCookie.domain = (
              val.charCodeAt(0) === 0x2e /* . */ ? val.slice(1) : val
            ).toLowerCase();
          }
          break;
        }
        case "path": {
          setCookie.path = val;
          break;
        }
        case "max-age": {
          if (val && maxAgeRegExp.test(val)) {
            // RFC 6265bis sec 5.5: cap to 400-day limit
            setCookie.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT);
          }
          break;
        }
        case "expires": {
          if (!val) break;
          const date = new Date(val);
          if (Number.isFinite(date.valueOf())) {
            // RFC 6265bis sec 5.5: cap to 400 days from now
            const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT * 1000);
            setCookie.expires = date > maxDate ? maxDate : date;
          }
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
          } else {
            // RFC 6265bis sec 5.6.7: unknown values default to "lax"
            setCookie.sameSite = "lax";
          }
          break;
        }
        default: {
          const attrLower = attr.toLowerCase();
          if (attrLower && !(attrLower in _nullProto)) {
            setCookie[attrLower] = val;
          }
        }
      }
    }

    index = endIdx + 1;
  }

  return setCookie;
}

// --- Internal Utils ---

function _trim(str: string, start: number, end: number): string {
  if (start === end) return "";
  let s = start;
  let e = end;
  while (s < e && (str.charCodeAt(s) === 0x20 || str.charCodeAt(s) === 0x09)) s++;
  while (e > s && (str.charCodeAt(e - 1) === 0x20 || str.charCodeAt(e - 1) === 0x09)) e--;
  return str.slice(s, e);
}

function _decode(value: string, decode?: ((value: string) => string) | undefined): string {
  if (!decode && !value.includes("%")) return value;
  try {
    return (decode || decodeURIComponent)(value);
  } catch {
    return value;
  }
}
