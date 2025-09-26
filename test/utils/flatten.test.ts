import { flatten } from '../../src/utils/flatten'

describe('utils', () => {
  describe('flatten', () => {
    it('flattens array one level deep', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4])
    })

    it('works with mixed types', () => {
      expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4])
    })

    it('works with empty arrays', () => {
      expect(flatten([[], [1, 2], []])).toEqual([1, 2])
    })

    it('works with nested arrays (only flattens one level)', () => {
      expect(flatten([[1, [2, 3]], [4]])).toEqual([1, [2, 3], 4])
    })

    it('works with empty input', () => {
      expect(flatten([])).toEqual([])
    })

    it('works with strings', () => {
      expect(flatten([['a', 'b'], ['c']])).toEqual(['a', 'b', 'c'])
    })
  })
})