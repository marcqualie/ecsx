import { pickBy } from '../../src/utils/pick-by'

describe('utils', () => {
  describe('pickBy', () => {
    it('picks properties based on predicate', () => {
      const obj = { a: 1, b: 2, c: 3, d: 4 }
      const result = pickBy(obj, (value) => (value as number) % 2 === 0)
      expect(result).toEqual({ b: 2, d: 4 })
    })

    it('works with truthy/falsy values', () => {
      const obj = { a: 1, b: null, c: undefined, d: 0, e: '' }
      const result = pickBy(obj, Boolean)
      expect(result).toEqual({ a: 1 })
    })

    it('predicate receives value and key', () => {
      const obj = { foo: 1, bar: 2, baz: 3 }
      const result = pickBy(obj, (value, key) => key.startsWith('b'))
      expect(result).toEqual({ bar: 2, baz: 3 })
    })

    it('returns empty object when no properties match', () => {
      const obj = { a: 1, b: 2, c: 3 }
      const result = pickBy(obj, () => false)
      expect(result).toEqual({})
    })

    it('works with empty object', () => {
      const result = pickBy({}, () => true)
      expect(result).toEqual({})
    })
  })
})