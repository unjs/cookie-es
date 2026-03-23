import { bench, group, run, compact, summary } from "mitata";
import * as cookieEs from "../src/index.ts";
import * as cookie from "cookie";

// --- Fixtures ---

const simpleCookie = "foo=bar";
// const multiCookie = "foo=bar; baz=qux; session=abc123; theme=dark; lang=en; debug=false";
const encodedCookie = "name=%E4%B8%AD%E6%96%87; path=%2Ftest%2F; special=%20%3B%3D";
const largeCookie = Array.from({ length: 50 }, (_, i) => `k${i}=v${i}`).join("; ");

const simpleSetCookie = "id=a; Path=/; HttpOnly; Secure; SameSite=Lax";
const complexSetCookie =
  "session=abc123; Domain=example.com; Path=/api; Expires=Thu, 01 Jan 2099 00:00:00 GMT; Max-Age=86400; HttpOnly; Secure; SameSite=Strict";

const serializeName = "session";
const serializeValue = "abc123";
const serializeOptions = {
  domain: "example.com",
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "Lax" as const,
  maxAge: 86400,
};

const joinedSetCookies = [simpleSetCookie, complexSetCookie].join(", ");

// --- parse() ---

summary(() => {
  compact(() => {
    group("parse: simple", () => {
      bench("cookie-es", () => cookieEs.parse(simpleCookie));
      bench("cookie", () => cookie.parse(simpleCookie));
    });

    // group("parse: multi", () => {
    //   bench("cookie-es", () => cookieEs.parse(multiCookie));
    //   bench("cookie", () => cookie.parse(multiCookie));
    // });

    group("parse: encoded", () => {
      bench("cookie-es", () => cookieEs.parse(encodedCookie));
      bench("cookie", () => cookie.parse(encodedCookie));
    });

    group("parse: large (50 pairs)", () => {
      bench("cookie-es", () => cookieEs.parse(largeCookie));
      bench("cookie", () => cookie.parse(largeCookie));
    });

    // --- serialize() ---

    group("serialize: simple", () => {
      bench("cookie-es", () => cookieEs.serialize(serializeName, serializeValue));
      bench("cookie", () => cookie.serialize(serializeName, serializeValue));
    });

    group("serialize: with options", () => {
      bench("cookie-es", () => cookieEs.serialize(serializeName, serializeValue, serializeOptions));
      bench("cookie", () => cookie.serialize(serializeName, serializeValue, serializeOptions));
    });

    // --- parseSetCookie() ---

    group("parseSetCookie: simple", () => {
      bench("cookie-es", () => cookieEs.parseSetCookie(simpleSetCookie));
      bench("cookie", () => cookie.parseSetCookie(simpleSetCookie));
    });

    group("parseSetCookie: complex", () => {
      bench("cookie-es", () => cookieEs.parseSetCookie(complexSetCookie));
      bench("cookie", () => cookie.parseSetCookie(complexSetCookie));
    });

    // --- splitSetCookieString() ---

    group("splitSetCookieString", () => {
      bench("cookie-es", () => cookieEs.splitSetCookieString(joinedSetCookies));
    });
  });
});

await run();
