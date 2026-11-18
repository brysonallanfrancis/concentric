import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import type { LinearFit } from "@/engine/profile";
import { niceTicks } from "@/lib/chart";
import { kgPerLb, weightValue } from "@/lib/format";
import type { Units } from "@/models/types";
import { useTheme } from "@/theme/theme";

export type TrendPoint = {
  time: number;
  valueLb: number;
  verified: boolean;
};

type Props = {
  points: TrendPoint[];
  trend: LinearFit | null;
  units: Units;
  height?: number;
};

const axisLeft = 36;
const axisBottom = 22;
const pad = 10;

export function TrendChart({ points, trend, units, height = 200 }: Props) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const times = points.map((point) => point.time);
  const values = points.map((point) => point.valueLb);
  const firstTime = Math.min(...times);
  const lastTime = Math.max(...times);
  const timeSpan = Math.max(lastTime - firstTime, 1);
  const spread = Math.max(Math.max(...values) - Math.min(...values), 10);
  const minValue = Math.min(...values) - spread * 0.2;
  const maxValue = Math.max(...values) + spread * 0.2;
  const plotWidth = width - axisLeft - pad * 2;
  const plotHeight = height - axisBottom - pad;

  const x = (time: number) => axisLeft + pad + ((time - firstTime) / timeSpan) * plotWidth;
  const y = (value: number) => pad + plotHeight - ((value - minValue) / (maxValue - minValue)) * plotHeight;

  const valueTicks = niceTicks(weightValue(minValue, units), weightValue(maxValue, units)).map((value) =>
    units === "kg" ? value / kgPerLb : value,
  );
  const timeTicks = lastTime > firstTime ? [firstTime, (firstTime + lastTime) / 2, lastTime] : [firstTime];
  const latest = points.reduce((newest, point) => (point.time > newest.time ? point : newest), points[0]);

  return (
    <View
      style={{ height }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Estimated max over time from ${points.length} sets. Latest set estimates ${weightValue(latest.valueLb, units)} ${units}.`}
    >
      {width > 0 && points.length > 0 && (
        <Svg width={width} height={height}>
          {valueTicks.map((tick) => (
            <SvgText key={tick} x={axisLeft - 6} y={y(tick) + 4} fontSize={10} fill={colors.textSecondary} textAnchor="end">
              {`${weightValue(tick, units)}`}
            </SvgText>
          ))}
          {valueTicks.map((tick) => (
            <Line key={`grid-${tick}`} x1={axisLeft} x2={width} y1={y(tick)} y2={y(tick)} stroke={colors.chartGrid} strokeWidth={0.5} />
          ))}
          {timeTicks.map((time, index) => (
            <SvgText
              key={time}
              x={x(time)}
              y={height - 6}
              fontSize={10}
              fill={colors.textSecondary}
              textAnchor={index === 0 ? "start" : index === timeTicks.length - 1 ? "end" : "middle"}
            >
              {new Date(time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </SvgText>
          ))}
          {trend && (
            <Line
              x1={x(firstTime)}
              y1={y(trend.intercept + trend.slope * firstTime)}
              x2={x(lastTime)}
              y2={y(trend.intercept + trend.slope * lastTime)}
              stroke={colors.chartMuted}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={x(point.time)}
              cy={y(point.valueLb)}
              r={4.5}
              fill={point.verified ? colors.chartLine : colors.surface}
              stroke={colors.chartLine}
              strokeWidth={1.5}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}
