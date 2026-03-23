# cookie-es

ESM `Cookie` and `Set-Cookie` parser/serializer for JS runtimes. Based on [jshttp/cookie](https://github.com/jshttp/cookie) and [nfriedly/set-cookie-parser](https://github.com/nfriedly/set-cookie-parser).

## Source Layout

```
src/
├── index.ts                  # Public re-exports
├── cookie/
│   ├── parse.ts              # parse() and parseSetCookie() (from jshttp/cookie)
│   ├── serialize.ts          # serialize() and stringifyCookie()
│   └── types.ts              # CookieParseOptions, CookieSerializeOptions, SetCookie, etc.
└── set-cookie/
    ├── parse.ts              # parseSetCookie() (from set-cookie-parser)
    ├── split.ts              # splitSetCookieString()
    └── types.ts              # SetCookieParseOptions, SetCookie (set-cookie variant)
```

**Note:** There are two `SetCookie` types and two `parseSetCookie` functions — one in `cookie/` (jshttp-based, exported) and one in `set-cookie/` (nfriedly-based, not currently exported from index). The `set-cookie/` variant has an index signature `[key: string]: unknown` for extra attributes.

## Public API

| Export | File | Description |
|---|---|---|
| `parse(str, opts?)` | `cookie/parse.ts` | Parse `Cookie` header → `Cookies` object. Supports `allowMultiple`, `filter`, `decode`. |
| `parseSetCookie(str, opts?)` | `cookie/parse.ts` | Parse `Set-Cookie` header → `SetCookie` object with all attributes. |
| `serialize(name, val, opts?)` | `cookie/serialize.ts` | Serialize name-value pair → `Set-Cookie` string. Also accepts `SetCookie` object. |
| `stringifyCookie(cookies, opts?)` | `cookie/serialize.ts` | Stringify `Cookies` object → `Cookie` header string. |
| `splitSetCookieString(input)` | `set-cookie/split.ts` | Split comma-joined `Set-Cookie` headers into individual strings. |

## Build & Test

```sh
pnpm build        # obuild → dist/
pnpm test         # lint + vitest with coverage
pnpm vitest run test/<file>  # run a single test file
pnpm lint         # oxlint + oxfmt --check
pnpm fmt          # automd + oxlint --fix + oxfmt
```

Package manager: **pnpm** (corepack). Build tool: **obuild**. Test runner: **vitest**. Linter: **oxlint + oxfmt**.

## Tests

```
test/
├── cookie-parse.test.ts         # parse() tests
├── cookie-serialize.test.ts     # serialize() tests
├── set-cookie-parser.test.ts    # set-cookie parseSetCookie() tests
└── split-cookies-string.test.ts # splitSetCookieString() tests
```

## References

- [RFC 6265bis (draft-ietf-httpbis-rfc6265bis-19)](.agents/rfc6265bis.txt) — Cookies: HTTP State Management Mechanism (obsoletes RFC 6265)

## Key Implementation Details

- `parse()` uses a custom zero-allocation `NullObject` (prototype-less) for output to avoid prototype pollution.
- `decode()` in `cookie/parse.ts` short-circuits when no `%` is present — avoids unnecessary `decodeURIComponent` calls.
- `serialize()` validates cookie name, value, domain, and path against RFC 6265 regexps before serializing.
- `splitSetCookieString()` handles commas inside `Expires` date values by checking for `=` after a comma to determine if it's a cookie separator.
- Upstream sync comments in source files track which version of jshttp/cookie and set-cookie-parser the code is based on.
