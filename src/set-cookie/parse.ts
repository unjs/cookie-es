// Based on https://github.com/nfriedly/set-cookie-parser (MIT)
// Copyright (c) 2015 Nathan Friedly <nathan@nfriedly.com> (http://nfriedly.com/)
// Last sync: v3.1.0

import type { SetCookie, SetCookieParseOptions } from "./types.ts";

/**
 * Parse a [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) header string into an object.
 */
export function parseSetCookie(
  setCookieValue: string,
  options?: SetCookieParseOptions,
): SetCookie | undefined {
  const parts = (setCookieValue || "")
    .split(";")
    .filter((str) => typeof str === "string" && !!str.trim());

  const nameValuePairStr = parts.shift() || "";
  const parsed = _parseNameValuePair(nameValuePairStr);

  const name = parsed.name;

  if (_isForbiddenKey(name)) {
    return undefined;
  }

  let value = parsed.value;
  try {
    value = options?.decode === false ? value : (options?.decode || decodeURIComponent)(value);
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
    const partValue = sides.join("=").trim();
    if (_isForbiddenKey(partKey)) {
      continue;
    }
    switch (partKey) {
      case "expires": {
        const date = new Date(partValue);
        if (!Number.isNaN(date.getTime())) {
          cookie.expires = date;
        }
        break;
      }
      case "max-age": {
        const n = Number.parseInt(partValue, 10);
        if (!Number.isNaN(n)) {
          cookie.maxAge = n;
        }
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
        cookie.sameSite = _parseSameSite(partValue);
        break;
      }
      case "partitioned": {
        cookie.partitioned = true;
        break;
      }
      case "priority": {
        cookie.priority = _parsePriority(partValue);
        break;
      }
      default: {
        if (partKey) {
          cookie[partKey] = partValue;
        }
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

function _isForbiddenKey(key: string): boolean {
  return !key || key in {};
}

const _sameSiteValues = new Set(["strict", "lax", "none"]);

function _parseSameSite(value: string): SetCookie["sameSite"] {
  const lower = value.toLowerCase();
  if (_sameSiteValues.has(lower)) {
    return lower as "strict" | "lax" | "none";
  }
  return undefined;
}

const _priorityValues = new Set(["low", "medium", "high"]);

function _parsePriority(value: string): SetCookie["priority"] {
  const lower = value.toLowerCase();
  if (_priorityValues.has(lower)) {
    return lower as "low" | "medium" | "high";
  }
  return undefined;
}
