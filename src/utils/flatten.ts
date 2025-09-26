/**
 * Flattens array a single level deep
 */
export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.flat() as T[]
}
