export function diff<T>(a: T[], b: T[]): T[] {
  return Array.from(
    new Set(
      a
        .filter((item) => !b.includes(item))
        .concat(b.filter((item) => !a.includes(item)))
    )
  );
}
