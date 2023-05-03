import type { CookieParseOptions, CookieSerializeOptions } from "./types";
export type { CookieParseOptions, CookieSerializeOptions } from "./types";

/**
 * Module letiables.
 * @private
 */
const decode = decodeURIComponent;
const encode = encodeURIComponent;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */
// eslint-disable-next-line no-control-regex
const fieldContentRegExp = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;

/**
 * Parse an HTTP Cookie header string and returning an object of all cookie
 * name-value pairs.
 *
 * @param str the string representing a `Cookie` header value
 * @param [options] object containing parsing options
 */
export function parse(
  str: string,
  options?: CookieParseOptions
): Record<string, string> {
  if (typeof str !== "string") {
    throw new TypeError("argument str must be a string");
  }

  const obj = {};
  const opt = options || {};
  const pairs = str.split(';');
  const dec = opt.decode || decode;

  for (const pair of pairs) {
    let eqIdx = pair.indexOf("=");

    // skip things that don't look like key=value
    if (eqIdx < 0) {
      continue;
    }

    const key = pair.slice(0, Math.max(0, eqIdx)).trim();

    // only assign once
    if (undefined === obj[key]) {
      // eslint-disable-next-line unicorn/prefer-string-slice
      let val = pair.substring(++eqIdx, pair.length).trim();
      // quoted values
      if (val[0] === '"') {
        val = val.slice(1, -1);
      }
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize a cookie name-value pair into a `Set-Cookie` header string.
 *
 * @param name the name for the cookie
 * @param value value to set the cookie to
 * @param [options] object containing serialization options
 * @throws {TypeError} when `maxAge` options is invalid
 */
export function serialize(
  name: string,
  value: string,
  options?: CookieSerializeOptions
): string {
  const opt = options || {};
  const enc = opt.encode || encode;

  if (typeof enc !== "function") {
    throw new TypeError("option encode is invalid");
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError("argument name is invalid");
  }

  const encodedValue = enc(value);

  if (encodedValue && !fieldContentRegExp.test(encodedValue)) {
    throw new TypeError("argument val is invalid");
  }

  let str = name + "=" + encodedValue;

  if (undefined !== opt.maxAge) {
    const maxAge = opt.maxAge - 0;

    if (Number.isNaN(maxAge) || !Number.isFinite(maxAge)) {
      throw new TypeError("option maxAge is invalid");
    }

    str += "; Max-Age=" + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError("option domain is invalid");
    }

    str += "; Domain=" + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError("option path is invalid");
    }

    str += "; Path=" + opt.path;
  }

  if (opt.expires) {
    if (!isDate(opt.expires) || isNaN(opt.expires.valueOf())) {
      throw new TypeError("option expires is invalid");
    }

    str += "; Expires=" + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += "; HttpOnly";
  }

  if (opt.secure) {
    str += "; Secure";
  }

  if (opt.sameSite) {
    const sameSite =
      typeof opt.sameSite === "string"
        ? opt.sameSite.toLowerCase()
        : opt.sameSite;

    switch (sameSite) {
      case true:
        str += "; SameSite=Strict";
        break;
      case "lax":
        str += "; SameSite=Lax";
        break;
      case "strict":
        str += "; SameSite=Strict";
        break;
      case "none":
        str += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }

  return str;
}

/**
 * Determine if value is a Date.
 *
 * @param {*} val
 * @private
 */

function isDate (val) {
  return Object.prototype.toString.call(val) === '[object Date]' ||
    val instanceof Date
}


/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */
function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch {
    return str;
  }
}
