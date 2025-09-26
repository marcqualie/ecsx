/**
 * Creates an object composed of the object properties predicate returns truthy for
 */
export const pickBy = <T extends Record<string, unknown>>(
  object: T,
  predicate: (value: T[keyof T], key: string) => unknown,
): Partial<T> => {
  const result: Partial<T> = {}

  for (const [key, value] of Object.entries(object)) {
    if (predicate(value as T[keyof T], key)) {
      result[key as keyof T] = value as T[keyof T]
    }
  }

  return result
}
