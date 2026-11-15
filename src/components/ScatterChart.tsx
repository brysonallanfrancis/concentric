import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import type { LinearFit, LoadVelocityPoint } from "@/engine/profile";
import { formatVelocity, kgPerLb, weightValue } from "@/lib/format";
import type { Units } from "@/models/types";
import { useTheme } from "@/theme/theme";

type Props = {
  points: LoadVelocityPoint[];
  fit: LinearFit | null;
  mvt: number;
  oneRepMaxLb: number | null;
  units: Units;
  height?: number;
};

const axisLeft = 32;
const axisBottom = 22;

export function ScatterChart({ points, fit, mvt, oneRepMaxLb, units, height = 220 }: Props) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const loads = points.map((point) => point.loadLb);
  const minLoad = Math.min(...loads) * 0.9;
  const maxLoad = Math.max(...loads, oneRepMaxLb ?? 0) * 1.03;
  const maxVelocity = Math.max(...points.map((point) => point.velocity), mvt) * 1.15;
  const plotWidth = width - axisLeft - 8;
  const plotHeight = height - axisBottom - 8;

  const x = (load: number) => axisLeft + ((load - minLoad) / (maxLoad - minLoad)) * plotWidth;
  const y = (velocity: number) => 8 + plotHeight - (velocity / maxVelocity) * plotHeight;

  const velocityTicks = [0.25, 0.5, 0.75, 1.0].filter((tick) => tick < maxVelocity);
  const loadTicks = niceTicks(weightValue(minLoad, units), weightValue(maxLoad, units)).map((value) =>
    units === "kg" ? value / kgPerLb : value,
  );

  return (
    <View
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Scatter plot of ${points.length} sets. Speed drops as weight goes up${
        oneRepMaxLb ? `, reaching the ${formatVelocity(mvt)} meters per second failure speed near ${weightValue(oneRepMaxLb, units)} ${units}` : ""
      }.`}
    >
      {width > 0 && points.length > 0 && (
        <Svg width={width} height={height}>
          {velocityTicks.map((tick) => (
            <SvgText key={tick} x={axisLeft - 6} y={y(tick) + 4} fontSize={10} fill={colors.textSecondary} textAnchor="end">
              {tick.toFixed(2).replace(/^0/, "")}
            </SvgText>
          ))}
          {loadTicks.map((load) => (
            <SvgText key={load} x={x(load)} y={height - 6} fontSize={10} fill={colors.textSecondary} textAnchor="middle">
              {`${weightValue(load, units)}`}
            </SvgText>
          ))}
          <Line x1={axisLeft} x2={width - 8} y1={8 + plotHeight} y2={8 + plotHeight} stroke={colors.chartGrid} />
          <Line x1={axisLeft} x2={width - 8} y1={y(mvt)} y2={y(mvt)} stroke={colors.failureLine} strokeDasharray="5 4" strokeWidth={1.5} />
          {fit && oneRepMaxLb && (
            <>
              <Line
                x1={x(minLoad)}
                y1={y(fit.intercept + fit.slope * minLoad)}
                x2={x(oneRepMaxLb)}
                y2={y(mvt)}
                stroke={colors.chartMuted}
                strokeWidth={1.5}
                strokeDasharray="2 3"
              />
              <Circle cx={x(oneRepMaxLb)} cy={y(mvt)} r={6} fill={colors.failureLine} />
            </>
          )}
          {points.map((point, index) => (
            <Circle key={index} cx={x(point.loadLb)} cy={y(point.velocity)} r={4} fill={colors.chartLine} opacity={0.85} />
          ))}
        </Svg>
      )}
    </View>
  );
}

function niceTicks(min: number, max: number): number[] {
  const span = max - min;
  const step = [5, 10, 20, 25, 50, 100, 200].find((candidate) => span / candidate <= 5) ?? 500;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max; value += step) ticks.push(value);
  return ticks;
}
