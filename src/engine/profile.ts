export type LoadVelocityPoint = {
  loadLb: number;
  velocity: number;
};

export type LinearFit = {
  slope: number;
  intercept: number;
};

export function fitLine(points: LoadVelocityPoint[]): LinearFit | null {
  if (points.length < 2) return null;
  const meanLoad = points.reduce((sum, point) => sum + point.loadLb, 0) / points.length;
  const meanVelocity = points.reduce((sum, point) => sum + point.velocity, 0) / points.length;
  let numerator = 0;
  let denominator = 0;
  for (const point of points) {
    numerator += (point.loadLb - meanLoad) * (point.velocity - meanVelocity);
    denominator += (point.loadLb - meanLoad) ** 2;
  }
  if (denominator === 0) return null;
  const slope = numerator / denominator;
  return { slope, intercept: meanVelocity - slope * meanLoad };
}

export function estimateOneRepMax(fit: LinearFit | null, mvt: number): number | null {
  if (!fit || fit.slope >= 0) return null;
  return (mvt - fit.intercept) / fit.slope;
}
