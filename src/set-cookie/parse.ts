// Based on https://github.com/nfriedly/set-cookie-parser (MIT) and https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>

import type { SetCookie, SetCookieParseOptions } from "./types.ts";
import { endIndex, eqIndex, valueSlice } from "../_utils.ts";

/**
 * RegExp to match max-age-value in RFC 6265 sec 5.6.2
 */
const maxAgeRegExp = /^-?\d+$/;

/**
 * Parse a [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header string into an object.
 */
export function parseSetCookie(
  str: string,
  options?: SetCookieParseOptions,
): SetCookie | undefined {
  const len = str.length;
  const _endIdx = endIndex(str, 0, len);
  const eqIdx = eqIndex(str, 0, _endIdx);

  // RFC 6265bis sec 5.2: no "=" means name is empty, value is the whole string
  const name = eqIdx === -1 ? "" : valueSlice(str, 0, eqIdx);
  if (name && _isForbiddenKey(name)) {
    return undefined;
  }

  let value = eqIdx === -1 ? valueSlice(str, 0, _endIdx) : valueSlice(str, eqIdx + 1, _endIdx);
  if (options?.decode !== false) {
    value = _decode(value, options?.decode);
  }

  const setCookie: SetCookie = { name, value };

  let index = _endIdx + 1;
  while (index < len) {
    const endIdx = endIndex(str, index, len);
    const eqIdx = eqIndex(str, index, endIdx);
    const attr = eqIdx === -1 ? valueSlice(str, index, endIdx) : valueSlice(str, index, eqIdx);
    const val = eqIdx === -1 ? undefined : valueSlice(str, eqIdx + 1, endIdx);
    const attrLower = attr.toLowerCase();

    if (_isForbiddenKey(attrLower)) {
      index = endIdx + 1;
      continue;
    }

    switch (attrLower) {
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
        if (!Number.isNaN(date.getTime())) setCookie.expires = date;
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
      default: {
        if (attrLower) {
          setCookie[attrLower] = val;
        }
      }
    }

    index = endIdx + 1;
  }

  return setCookie;
}

// --- Internal Utils ---

function _isForbiddenKey(key: string): boolean {
  return !key || key in {};
}

function _decode(value: string, decode?: ((value: string) => string) | undefined): string {
  try {
    return (decode || decodeURIComponent)(value);
  } catch {
    return value;
  }
}
