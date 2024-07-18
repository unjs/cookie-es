// Based on https://github.com/nfriedly/set-cookie-parser (MIT)
// Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
// Last sync: v2.6.0 830debeeeec2ee21a36256bdef66485879dd18cd

import type { SetCookie, SetCookieParseOptions } from "./types";

/**
 * Parse a [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header string into an object.
 */
export function parseSetCookie(
  setCookieValue: string,
  options?: SetCookieParseOptions,
): SetCookie {
  const parts = (setCookieValue || "")
    .split(";")
    .filter((str) => typeof str === "string" && !!str.trim());

  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);

  const name = parsed.name;

  let value = parsed.value;
  try {
    value =
      options?.decode === false
        ? value
        : (options?.decode || decodeURIComponent)(value);
  } catch {
    // Fallback to undecoded value
  }

  const cookie: SetCookie = {
    name: name,
    value: value,
  };

  for (const part of parts) {
    const sides = part.split("=");
    const partKey = (sides.shift() || "").trimStart().toLowerCase();
    const partValue = sides.join("=");
    switch (partKey) {
      case "expires": {
        cookie.expires = new Date(partValue);
        break;
      }
      case "max-age": {
        cookie.maxAge = Number.parseInt(partValue, 10);
        break;
      }
      case "secure": {
        cookie.secure = true;
        break;
      }
      case "httponly": {
        cookie.httpOnly = true;
        break;
      }
      case "samesite": {
        cookie.sameSite = partValue;
        break;
      }
      default: {
        cookie[partKey] = partValue;
      }
    }
  }

  return cookie;
}

// --- Internal Utils ---

/** Parses name-value-pair according to rfc6265bis draft */
function _parseNameValuePair(nameValuePairStr: string) {
  let name = "";
  let value = "";
  const nameValueArr = nameValuePairStr.split("=");
  if (nameValueArr.length > 1) {
    name = nameValueArr.shift()!;
    // Everything after the first =, joined by a "=" if there was more than one part
    value = nameValueArr.join("=");
  } else {
    value = nameValuePairStr;
  }

  return { name: name, value: value };
}
