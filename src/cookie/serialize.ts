// Based on https://github.com/jshttp/cookie (MIT)
// Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
// Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
// Last sync: v1.1.1 (e264dfa)

import type {
  Cookies,
  SetCookie,
  CookieStringifyOptions,
  CookieSerializeOptions,
} from "./types.ts";
import { COOKIE_MAX_AGE_LIMIT } from "../_utils.ts";

export type {
  CookieParseOptions,
  CookieSerializeOptions,
  CookieStringifyOptions,
  Cookies,
  SetCookie,
} from "./types.ts";

/**
 * RegExp to match cookie-name in RFC 6265bis sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */
const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;

/**
 * RegExp to match cookie-value in RFC 6265bis sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;

/**
 * RegExp to match domain-value in RFC 6265bis sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */
const domainValueRegExp =
  /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;

/**
 * RegExp to match path-value in RFC 6265bis sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */
const pathValueRegExp = /^[\u0020-\u003A\u003C-\u007E]*$/;

const __toString = Object.prototype.toString;

/**
 * Stringify a cookies object into an HTTP `Cookie` header string.
 *
 * @param cookie - An object of cookie name-value pairs.
 * @param options - Stringify options (`encode`).
 * @returns A `Cookie` header string (e.g. `"foo=bar; baz=qux"`).
 */
export function stringifyCookie(cookie: Cookies, options?: CookieStringifyOptions): string {
  const enc = options?.encode || encodeURIComponent;
  const keys = Object.keys(cookie);
  let str = "";

  for (const [i, name] of keys.entries()) {
    const val = cookie[name];
    if (val === undefined) continue;

    if (!cookieNameRegExp.test(name)) {
      throw new TypeError(`cookie name is invalid: ${name}`);
    }

    const value = enc(val);

    if (!cookieValueRegExp.test(value)) {
      throw new TypeError(`cookie val is invalid: ${val}`);
    }

    if (i > 0) str += "; ";
    str += name + "=" + value;
  }

  return str;
}

/**
 * Serialize a cookie into a `Set-Cookie` header string.
 *
 * Accepts either a name-value pair with options or a `SetCookie` object.
 * Non-string values are coerced to strings. Validates name, value, domain,
 * and path against RFC 6265bis.
 *
 * @example
 * ```js
 * serialize("foo", "bar", { httpOnly: true });
 * // => "foo=bar; HttpOnly"
 *
 * serialize({ name: "foo", value: "bar", secure: true });
 * // => "foo=bar; Secure"
 * ```
 */
export function serialize(cookie: SetCookie, options?: CookieStringifyOptions): string;
export function serialize(name: string, val: unknown, options?: CookieSerializeOptions): string;
export function serialize(
  _a0: string | SetCookie,
  _a1?: unknown,
  _a2?: CookieSerializeOptions,
): string {
  const isObj = typeof _a0 === "object";
  const options = isObj ? (_a1 as CookieStringifyOptions) : _a2;
  const stringify = options?.stringify || JSON.stringify;
  const cookie = isObj
    ? _a0
    : {
        ..._a2,
        name: _a0,
        value: _a1 == undefined ? "" : typeof _a1 === "string" ? _a1 : stringify(_a1),
      };

  const enc = options?.encode || encodeURIComponent;

  if (!cookieNameRegExp.test(cookie.name)) {
    throw new TypeError(`argument name is invalid: ${cookie.name}`);
  }

  const value = cookie.value ? enc(cookie.value) : "";

  if (!cookieValueRegExp.test(value)) {
    throw new TypeError(`argument val is invalid: ${cookie.value}`);
  }

  // RFC 6265bis: validate attributes requiring Secure
  if (!cookie.secure) {
    // CHIPS: Partitioned requires Secure
    if (cookie.partitioned) {
      throw new TypeError(`Partitioned cookies must have the Secure attribute`);
    }
    // RFC 6265bis sec 4.1.2.7: SameSite=None requires Secure
    if (cookie.sameSite && String(cookie.sameSite).toLowerCase() === "none") {
      throw new TypeError(`SameSite=None cookies must have the Secure attribute`);
    }
    // RFC 6265bis sec 4.1.3: __Secure- prefix requires Secure
    if (
      cookie.name.length > 9 &&
      cookie.name.charCodeAt(0) === 95 /* _ */ &&
      cookie.name.charCodeAt(1) === 95 /* _ */
    ) {
      const nameLower = cookie.name.toLowerCase();
      if (nameLower.startsWith("__secure-") || nameLower.startsWith("__host-")) {
        throw new TypeError(`${cookie.name} cookies must have the Secure attribute`);
      }
    }
  }

  // RFC 6265bis sec 4.1.3.2: __Host- prefix validation
  if (
    cookie.name.length > 7 &&
    cookie.name.charCodeAt(0) === 95 /* _ */ &&
    cookie.name.charCodeAt(1) === 95 /* _ */ &&
    cookie.name.toLowerCase().startsWith("__host-")
  ) {
    if (cookie.path !== "/") {
      throw new TypeError(`__Host- cookies must have Path=/`);
    }
    if (cookie.domain) {
      throw new TypeError(`__Host- cookies must not have a Domain attribute`);
    }
  }

  let str = cookie.name + "=" + value;

  if (cookie.maxAge !== undefined) {
    if (!Number.isInteger(cookie.maxAge)) {
      throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
    }

    // RFC 6265bis: clamp negative to 0, cap to 400-day limit
    str += "; Max-Age=" + Math.max(0, Math.min(cookie.maxAge, COOKIE_MAX_AGE_LIMIT));
  }

  if (cookie.domain) {
    if (!domainValueRegExp.test(cookie.domain)) {
      throw new TypeError(`option domain is invalid: ${cookie.domain}`);
    }

    str += "; Domain=" + cookie.domain;
  }

  if (cookie.path) {
    if (!pathValueRegExp.test(cookie.path)) {
      throw new TypeError(`option path is invalid: ${cookie.path}`);
    }

    str += "; Path=" + cookie.path;
  }

  if (cookie.expires) {
    if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
      throw new TypeError(`option expires is invalid: ${cookie.expires}`);
    }

    str += "; Expires=" + cookie.expires.toUTCString();
  }

  if (cookie.httpOnly) {
    str += "; HttpOnly";
  }

  if (cookie.secure) {
    str += "; Secure";
  }

  if (cookie.partitioned) {
    str += "; Partitioned";
  }

  if (cookie.priority) {
    const priority =
      typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : undefined;
    switch (priority) {
      case "low": {
        str += "; Priority=Low";
        break;
      }
      case "medium": {
        str += "; Priority=Medium";
        break;
      }
      case "high": {
        str += "; Priority=High";
        break;
      }
      default: {
        throw new TypeError(`option priority is invalid: ${cookie.priority}`);
      }
    }
  }

  if (cookie.sameSite) {
    const sameSite =
      typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
    switch (sameSite) {
      case true:
      case "strict": {
        str += "; SameSite=Strict";
        break;
      }
      case "lax": {
        str += "; SameSite=Lax";
        break;
      }
      case "none": {
        str += "; SameSite=None";
        break;
      }
      default: {
        throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
      }
    }
  }

  return str;
}

// --- Internal Utils ---

/**
 * Determine if value is a Date.
 */
function isDate(val: unknown): val is Date {
  return __toString.call(val) === "[object Date]";
}
