export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}

export function requirePositiveTitleCount(value: string[]): void {
  if (value.length !== 30) {
    throw new Error('Expected 30 titles');
  }
}
