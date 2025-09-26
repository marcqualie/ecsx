import { identity } from '../../src/utils/identity'

describe('utils', () => {
  describe('identity', () => {
    it('returns the same value passed to it', () => {
      expect(identity(5)).toBe(5)
      expect(identity('hello')).toBe('hello')
      expect(identity(true)).toBe(true)
      expect(identity(null)).toBe(null)
      expect(identity(undefined)).toBe(undefined)
    })

    it('works with objects', () => {
      const obj = { a: 1, b: 2 }
      expect(identity(obj)).toBe(obj)
    })

    it('works with arrays', () => {
      const arr = [1, 2, 3]
      expect(identity(arr)).toBe(arr)
    })
  })
})