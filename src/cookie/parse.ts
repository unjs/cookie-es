// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: 84a156749b673dbfbf43679829b15be09fbd8988

import type { CookieParseOptions } from "./types";
/**
 * Parse an HTTP Cookie header string and returning an object of all cookie
 * name-value pairs.
 *
 * @param str the string representing a `Cookie` header value
 * @param [options] object containing parsing options
 */
export function parse(
  str: string,
  options?: CookieParseOptions,
): Record<string, string> {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }

  const obj = {};
  const opt = options || {};
  const dec = opt.decode || decode;

  let index = 0;
  while (index < str.length) {
    const eqIdx = str.indexOf("=", index);

    // no more cookie pairs
    if (eqIdx === -1) {
      break;
    }

    let endIdx = str.indexOf(";", index);

    if (endIdx === -1) {
      endIdx = str.length;
    } else if (endIdx < eqIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }

    const key = str.slice(index, eqIdx).trim();
    if (opt?.filter && !opt?.filter(key)) {
      index = endIdx + 1;
      continue;
    }

    // only assign once
    if (undefined === obj[key as keyof typeof obj]) {
      let val = str.slice(eqIdx + 1, endIdx).trim();

      // quoted values
      if (val.codePointAt(0) === 0x22) {
        val = val.slice(1, -1);
      }

      (obj as any)[key] = tryDecode(val, dec);
    }

    index = endIdx + 1;
  }

  return obj;
}

function decode(str: string) {
  return str.includes("%") ? decodeURIComponent(str) : str;
}

function tryDecode(
  str: string,
  decode: Exclude<CookieParseOptions["decode"], undefined>,
) {
  try {
    return decode(str);
  } catch {
    return str;
  }
}
