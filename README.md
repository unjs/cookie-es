# 🍪 cookie-es

<!-- automd:badges bundlejs packagephobia codecov -->

[![npm version](https://img.shields.io/npm/v/cookie-es)](https://npmjs.com/package/cookie-es)
[![npm downloads](https://img.shields.io/npm/dm/cookie-es)](https://npm.chart.dev/cookie-es)
[![bundle size](https://img.shields.io/bundlejs/size/cookie-es)](https://bundlejs.com/?q=cookie-es)
[![install size](https://badgen.net/packagephobia/install/cookie-es)](https://packagephobia.com/result?p=cookie-es)
[![codecov](https://img.shields.io/codecov/c/gh/unjs/cookie-es)](https://codecov.io/gh/unjs/cookie-es)

<!-- /automd -->

ESM-ready [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie) and [`Set-Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) parser and serializer based on [cookie](https://github.com/jshttp/cookie) and [set-cookie-parser](https://github.com/nfriedly/set-cookie-parser) with built-in TypeScript types.

## Install

```sh
# ✨ Auto-detect (npm, yarn, pnpm, bun, deno)
npx nypm install cookie-es
```

## Import

**ESM** (Node.js, Bun, Deno)

```js
import {
  parse,
  parseSetCookie,
  serialize,
  stringifyCookie,
  splitSetCookieString,
} from "cookie-es";
```

**CDN** (Deno, Bun and Browsers)

```js
import {
  parse,
  parseSetCookie,
  serialize,
  stringifyCookie,
  splitSetCookieString,
} from "https://esm.sh/cookie-es";
```

## API

### `parse(str, options?)`

Parse a `Cookie` header string into an object. First occurrence wins for duplicate names.

```js
parse("foo=bar; equation=E%3Dmc%5E2");
// { foo: "bar", equation: "E=mc^2" }

// Custom decoder
parse("foo=bar", { decode: (v) => v });

// Only parse specific keys
parse("a=1; b=2; c=3", { filter: (key) => key !== "b" });
// { a: "1", c: "3" }
```

### `parseSetCookie(str, options?)`

Parse a `Set-Cookie` header string into an object with all cookie attributes.

```js
parseSetCookie(
  "id=abc; Domain=example.com; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Partitioned; Priority=High",
);
// {
//   name: "id",
//   value: "abc",
//   domain: "example.com",
//   path: "/",
//   httpOnly: true,
//   secure: true,
//   sameSite: "lax",
//   maxAge: 3600,
//   partitioned: true,
//   priority: "high",
// }
```

Supports `decode` and `filter` options same as `parse`.

### `serialize(name, value, options?)`

Serialize a cookie name-value pair into a `Set-Cookie` header string.

```js
serialize("foo", "bar", { httpOnly: true, secure: true, maxAge: 3600 });
// "foo=bar; Max-Age=3600; HttpOnly; Secure"

// Also accepts a cookie object
serialize({
  name: "foo",
  value: "bar",
  domain: "example.com",
  path: "/",
  sameSite: "lax",
});
// "foo=bar; Domain=example.com; Path=/; SameSite=Lax"
```

Supported attributes: `maxAge`, `expires`, `domain`, `path`, `httpOnly`, `secure`, `sameSite`, `priority`, `partitioned`. Use `encode` option for custom value encoding (default: `encodeURIComponent`).

### `stringifyCookie(cookies, options?)`

Stringify a cookies object into an HTTP `Cookie` header string.

```js
stringifyCookie({ foo: "bar", baz: "qux" });
// "foo=bar; baz=qux"
```

### `splitSetCookieString(input)`

Split comma-joined `Set-Cookie` headers into individual strings. Correctly handles commas within cookie attributes like `Expires` dates.

```js
splitSetCookieString(
  "foo=bar; Expires=Thu, 01 Jan 2026 00:00:00 GMT, baz=qux",
);
// ["foo=bar; Expires=Thu, 01 Jan 2026 00:00:00 GMT", "baz=qux"]

// Also accepts an array
splitSetCookieString(["a=1, b=2", "c=3"]);
// ["a=1", "b=2", "c=3"]
```

## Parsing Options

### `allowMultiple`

By default, when a cookie name appears more than once, only the first value is kept. Set `allowMultiple: true` to collect all values into an array:

```js
import { parse } from "cookie-es";

// Default: first value wins
parse("foo=a;bar=b;foo=c");
// => { foo: "a", bar: "b" }

// With allowMultiple: duplicates return arrays
parse("foo=a;bar=b;foo=c", { allowMultiple: true });
// => { foo: ["a", "c"], bar: "b" }
```

## License

[MIT](./LICENSE)

Based on [jshttp/cookie](https://github.com/jshttp/cookie) (Roman Shtylman and Douglas Christopher Wilson) and [nfriedly/set-cookie-parser](https://github.com/nfriedly/set-cookie-parser) (Nathan Friedly).
