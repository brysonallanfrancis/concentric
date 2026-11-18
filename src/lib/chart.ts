export function niceTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = [5, 10, 20, 25, 50, 100, 200].find((candidate) => span / candidate <= 5) ?? 500;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) ticks.push(value);
  return ticks;
}
