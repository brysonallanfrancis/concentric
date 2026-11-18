export type LoadVelocityPoint = {
  loadLb: number;
  velocity: number;
};

export type LinearFit = {
  slope: number;
  intercept: number;
};

export function linearFit(xs: number[], ys: number[]): LinearFit | null {
  if (xs.length < 2) return null;
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  let numerator = 0;
  let denominator = 0;
  xs.forEach((x, index) => {
    numerator += (x - meanX) * (ys[index] - meanY);
    denominator += (x - meanX) ** 2;
  });
  if (denominator === 0) return null;
  const slope = numerator / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

export function fitLine(points: LoadVelocityPoint[]): LinearFit | null {
  return linearFit(
    points.map((point) => point.loadLb),
    points.map((point) => point.velocity),
  );
}

export function estimateOneRepMax(fit: LinearFit | null, mvt: number): number | null {
  if (!fit || fit.slope >= 0) return null;
  return (mvt - fit.intercept) / fit.slope;
}

export function estimateMaxFromReps(loadLb: number, reps: number): number | null {
  if (reps < 1 || loadLb <= 0) return null;
  return reps === 1 ? loadLb : loadLb * (1 + reps / 30);
}
