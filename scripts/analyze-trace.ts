import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { analyzeTrace, type TraceAnalysis } from "@/engine/traceAnalysis";
import type { Trace } from "@/sensors/trace";

const outputDirectory = "analysis";
const files = process.argv.slice(2);

if (files.length === 0) {
  console.log("Usage: npm run analyze -- <trace.json> [more traces...]");
  process.exit(1);
}

mkdirSync(outputDirectory, { recursive: true });

for (const file of files) {
  const trace = JSON.parse(readFileSync(file, "utf8")) as Trace;
  const analysis = analyzeTrace(trace.samples);
  printSummary(file, trace, analysis);
  const output = join(outputDirectory, basename(file).replace(/\.json$/, ".html"));
  writeFileSync(output, renderReport(file, trace, analysis));
  console.log(`  report: ${output}\n`);
}

function printSummary(file: string, trace: Trace, analysis: TraceAnalysis) {
  const { setup, label } = trace;
  console.log(`${basename(file)}`);
  console.log(
    `  ${setup.exercise} · ${setup.mount} · ${setup.loadLb} lb · labeled ${label.actualReps} reps${label.reachedFailure ? " + failed rep" : ""}`,
  );
  console.log(
    `  ${trace.samples.length} samples · ${analysis.sampleRateHz.toFixed(1)} Hz measured (requested ${(1000 / trace.requestedIntervalMs).toFixed(0)} Hz)`,
  );
  console.log(`  detected ${analysis.reps.length} concentric phases, ${analysis.reps.filter((rep) => rep.partial).length} partial`);
  console.table(
    analysis.reps.map((rep) => ({
      rep: rep.number,
      "start s": rep.concentric.startT.toFixed(2),
      "mean v m/s": rep.concentric.meanVelocity.toFixed(2),
      "peak v m/s": rep.concentric.peakVelocity.toFixed(2),
      "ROM cm": (rep.concentric.rom * 100).toFixed(0),
      "eccentric s": rep.eccentricSeconds?.toFixed(2) ?? "—",
      partial: rep.partial ? "PARTIAL" : "",
    })),
  );
}

function renderReport(file: string, trace: Trace, analysis: TraceAnalysis): string {
  const width = 1100;
  const shading = analysis.phases.map((phase) => ({
    from: phase.startT,
    to: phase.endT,
    color: phase.direction === "up" ? "rgba(10,96,208,0.12)" : "rgba(194,87,10,0.10)",
  }));
  const partialShading = analysis.reps
    .filter((rep) => rep.partial)
    .map((rep) => ({ from: rep.concentric.startT, to: rep.concentric.endT, color: "rgba(215,0,21,0.25)" }));
  const stillShading = runs(analysis.still).map(([from, to]) => ({
    from: analysis.t[from],
    to: analysis.t[to],
    color: "rgba(0,0,0,0.06)",
  }));

  const charts = [
    lineChart("Vertical acceleration (m/s², filtered)", analysis.t, analysis.vertical, width, [...stillShading]),
    lineChart("Velocity (m/s, drift corrected)", analysis.t, analysis.velocity, width, [...shading, ...partialShading]),
    lineChart("Displacement (m)", analysis.t, analysis.displacement, width, [...shading, ...partialShading]),
    repBars(analysis, width),
  ];

  return `<!doctype html><html><head><meta charset="utf-8"><title>${basename(file)}</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;margin:24px;color:#1C1C1E;background:#F2F2F7}
section{background:#fff;border-radius:12px;padding:16px;margin-bottom:16px}h1{font-size:20px}h2{font-size:14px;color:#6C6C70;margin:0 0 8px}
table{border-collapse:collapse;font-variant-numeric:tabular-nums}td,th{padding:4px 12px;text-align:right;border-bottom:1px solid #E5E5EA}
.partial{color:#D70015;font-weight:600}</style></head><body>
<h1>${basename(file)}</h1>
<p>${trace.setup.exercise} · ${trace.setup.mount} · ${trace.setup.loadLb} lb · labeled ${trace.label.actualReps} reps${trace.label.reachedFailure ? " + a failed rep" : ""} · ${analysis.sampleRateHz.toFixed(1)} Hz measured${trace.label.note ? ` · “${escapeHtml(trace.label.note)}”` : ""}</p>
<p>Blue = moving up, orange = moving down, red = partial rep, gray = phone still.</p>
${charts.map((chart) => `<section>${chart}</section>`).join("\n")}
<section><h2>Reps</h2><table><tr><th>Rep</th><th>Mean v</th><th>Peak v</th><th>ROM cm</th><th>Eccentric s</th><th></th></tr>
${analysis.reps
  .map(
    (rep) =>
      `<tr class="${rep.partial ? "partial" : ""}"><td>${rep.number}</td><td>${rep.concentric.meanVelocity.toFixed(2)}</td><td>${rep.concentric.peakVelocity.toFixed(2)}</td><td>${(rep.concentric.rom * 100).toFixed(0)}</td><td>${rep.eccentricSeconds?.toFixed(2) ?? "—"}</td><td>${rep.partial ? "partial" : ""}</td></tr>`,
  )
  .join("")}
</table></section></body></html>`;
}

type Shade = { from: number; to: number; color: string };

function lineChart(title: string, t: number[], values: number[], width: number, shades: Shade[]): string {
  const height = 220;
  const pad = 40;
  const tMax = t[t.length - 1] || 1;
  const maxAbs = Math.max(0.01, ...values.map(Math.abs));
  const x = (time: number) => pad + (time / tMax) * (width - pad - 10);
  const y = (value: number) => height / 2 - (value / maxAbs) * (height / 2 - 12);
  const step = Math.max(1, Math.floor(values.length / 3000));
  const points = values
    .filter((_, index) => index % step === 0)
    .map((value, index) => `${x(t[index * step]).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  const ticks = Array.from({ length: Math.floor(tMax) + 1 }, (_, second) => second).filter((second) => second % 2 === 0);

  return `<h2>${title}</h2><svg width="${width}" height="${height}">
${shades.map((shade) => `<rect x="${x(shade.from)}" y="0" width="${Math.max(1, x(shade.to) - x(shade.from))}" height="${height}" fill="${shade.color}"/>`).join("")}
<line x1="${pad}" x2="${width - 10}" y1="${height / 2}" y2="${height / 2}" stroke="#C7C7CC"/>
${ticks.map((second) => `<text x="${x(second)}" y="${height - 2}" font-size="10" fill="#6C6C70" text-anchor="middle">${second}s</text>`).join("")}
<text x="4" y="14" font-size="10" fill="#6C6C70">${maxAbs.toFixed(2)}</text><text x="4" y="${height - 14}" font-size="10" fill="#6C6C70">-${maxAbs.toFixed(2)}</text>
<polyline points="${points}" fill="none" stroke="#0A60D0" stroke-width="1.5"/></svg>`;
}

function repBars(analysis: TraceAnalysis, width: number): string {
  const height = 200;
  const reps = analysis.reps;
  if (reps.length === 0) return "<h2>Mean concentric velocity per rep</h2><p>No reps detected.</p>";
  const max = Math.max(...reps.map((rep) => rep.concentric.meanVelocity), 0.1);
  const barWidth = Math.min(60, (width - 40) / reps.length - 8);
  const bars = reps
    .map((rep, index) => {
      const barHeight = (rep.concentric.meanVelocity / max) * (height - 40);
      const x = 20 + index * (barWidth + 8);
      return `<rect x="${x}" y="${height - 20 - barHeight}" width="${barWidth}" height="${barHeight}" rx="4" fill="${rep.partial ? "#D70015" : "#0A60D0"}"/>
<text x="${x + barWidth / 2}" y="${height - 24 - barHeight}" font-size="11" text-anchor="middle">${rep.concentric.meanVelocity.toFixed(2)}</text>
<text x="${x + barWidth / 2}" y="${height - 6}" font-size="11" fill="#6C6C70" text-anchor="middle">${rep.number}</text>`;
    })
    .join("");
  return `<h2>Mean concentric velocity per rep (m/s)</h2><svg width="${width}" height="${height}">${bars}</svg>`;
}

function runs(flags: boolean[]): [number, number][] {
  const result: [number, number][] = [];
  let start = -1;
  flags.forEach((flag, index) => {
    if (flag && start < 0) start = index;
    if ((!flag || index === flags.length - 1) && start >= 0) {
      result.push([start, flag ? index : index - 1]);
      start = -1;
    }
  });
  return result;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] ?? character);
}
