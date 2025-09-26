import { uniq } from '../../src/utils/uniq'

describe('utils', () => {
  describe('uniq', () => {
    it('removes duplicate values from array', () => {
      expect(uniq([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
    })

    it('works with strings', () => {
      expect(uniq(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('works with empty array', () => {
      expect(uniq([])).toEqual([])
    })

    it('preserves order of first occurrence', () => {
      expect(uniq([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })

    it('works with objects (by reference)', () => {
      const obj1 = { id: 1 }
      const obj2 = { id: 2 }
      const obj3 = { id: 1 }
      expect(uniq([obj1, obj2, obj1, obj3])).toEqual([obj1, obj2, obj3])
    })
  })
})