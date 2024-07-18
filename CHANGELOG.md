# Changelog


## v1.2.0

[compare changes](https://github.com/unjs/cookie-es/compare/v1.1.0...v1.2.0)

### 🚀 Enhancements

- **parse:** Support `filter` option for key filtering ([#35](https://github.com/unjs/cookie-es/pull/35))
- Add utils to parse `set-cookie` ([#43](https://github.com/unjs/cookie-es/pull/43))

### 📖 Documentation

- Fix links for `partitioned` attribute of `CookieSerializeOptions` ([#34](https://github.com/unjs/cookie-es/pull/34))

### 📦 Build

- Fix type exports ([f8c35c3](https://github.com/unjs/cookie-es/commit/f8c35c3))

### 🏡 Chore

- Update repo ([b558f84](https://github.com/unjs/cookie-es/commit/b558f84))
- Apply automated updates ([abad077](https://github.com/unjs/cookie-es/commit/abad077))
- Update deps ([1b3631a](https://github.com/unjs/cookie-es/commit/1b3631a))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Potter <75838259@qq.com>
- Damian Głowala ([@DamianGlowala](http://github.com/DamianGlowala))

## v1.1.0

[compare changes](https://github.com/unjs/cookie-es/compare/v1.0.0...v1.1.0)

### 🚀 Enhancements

- Add `partitioned` option ([#21](https://github.com/unjs/cookie-es/pull/21))

### 🏡 Chore

- Update dependencies ([d217a34](https://github.com/unjs/cookie-es/commit/d217a34))
- Lint ([37db26e](https://github.com/unjs/cookie-es/commit/37db26e))
- Update ci scripts ([ca6ba07](https://github.com/unjs/cookie-es/commit/ca6ba07))
- Use automd ([bcf66c0](https://github.com/unjs/cookie-es/commit/bcf66c0))

### ❤️ Contributors

- Alexander G <alexxandergrib@gmail.com>
- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.0.0


### 🚀 Enhancements

  - Add `priority` option (8b91b0c)
  - Add types for `priority` option (e315835)

### 🔥 Performance

  - Improve default decode speed (8aeac0a)

### 🩹 Fixes

  - **pkg:** Add `types` subpath export (#4)
  - Add explicit return types to exported functions (#2)
  - `expires` option should reject invalid dates (1a69d74)
  - **serialize:** Handle `maxAge` with `null` value (e4da31d)

### 🏡 Chore

  - Update repo (c8a3759)
  - Add renovate.json (be32c11)
  - Update lockfile (68814e6)
  - Add codecov.yml (0c2e709)
  - Gitignore `.eslintcache` (21a077b)
  - Lint (1dc5260)

### ✅ Tests

  - Add pnpm, vitest and a test for serialising cookie (#3)
  - Port all tests from upstream (#8)

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- W. Brian Gourlie ([@bgourlie](http://github.com/bgourlie))
- Daniel Roe <daniel@roe.dev>

