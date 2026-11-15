export function lowPass(values: number[], sampleRateHz: number, cutoffHz: number): number[] {
  if (values.length === 0) return [];
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / sampleRateHz;
  const alpha = dt / (rc + dt);
  const output = new Array<number>(values.length);
  output[0] = values[0];
  for (let i = 1; i < values.length; i++) {
    output[i] = output[i - 1] + alpha * (values[i] - output[i - 1]);
  }
  return output;
}

export function zeroPhaseLowPass(values: number[], sampleRateHz: number, cutoffHz: number): number[] {
  const forward = lowPass(values, sampleRateHz, cutoffHz);
  return lowPass(forward.reverse(), sampleRateHz, cutoffHz).reverse();
}

export function cumulativeIntegral(values: number[], times: number[]): number[] {
  const output = new Array<number>(values.length).fill(0);
  for (let i = 1; i < values.length; i++) {
    output[i] = output[i - 1] + ((values[i] + values[i - 1]) / 2) * (times[i] - times[i - 1]);
  }
  return output;
}

export function rollingMaximum(values: number[], windowSize: number): number[] {
  const half = Math.max(1, Math.floor(windowSize / 2));
  return values.map((_, index) => {
    let maximum = -Infinity;
    const end = Math.min(values.length, index + half + 1);
    for (let i = Math.max(0, index - half); i < end; i++) maximum = Math.max(maximum, values[i]);
    return maximum;
  });
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}
