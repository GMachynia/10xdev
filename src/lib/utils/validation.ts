/**
 * Validates if a string is a valid UUID v4 format.
 *
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 *
 * @example
 * ```typescript
 * isValidUUID('550e8400-e29b-41d4-a716-446655440000') // true
 * isValidUUID('invalid-uuid') // false
 * ```
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== "string") {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
