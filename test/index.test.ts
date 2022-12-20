import { describe, it, expect } from 'vitest'
import { parse, serialize } from '../src'

describe('parse', () => {
  it('should parse cookies', () => {
    expect(parse('_ga=GA1.2.1213593123.1630877715')).toMatchInlineSnapshot(`
      {
        "_ga": "GA1.2.1213593123.1630877715",
      }
    `)
  })
})

describe('serialize', () => {
  it('should serialize cookies', () => {
    expect(serialize('userId', '123', {
      expires: new Date(1671545415207 + 30 * 1000 * 86400),
    })).toMatchInlineSnapshot('"userId=123; Expires=Thu, 19 Jan 2023 14:10:15 GMT"')
  })
})
