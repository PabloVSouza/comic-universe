export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target } as T

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key]
      const targetValue = (result as Record<string, unknown>)[key]

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        ;(result as Record<string, unknown>)[key] = deepMerge(targetValue, sourceValue)
      } else {
        // Override with source value
        ;(result as Record<string, unknown>)[key] = sourceValue
      }
    }
  }

  return result
}
