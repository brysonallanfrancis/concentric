import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";
import { formatShortVelocity, formatVelocity } from "@/lib/format";
import type { RepResult } from "@/models/types";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  reps: RepResult[];
  mvt: number;
  height?: number;
  minimumSlots?: number;
};

export function RepBarChart({ reps, mvt, height = 150, minimumSlots = 5 }: Props) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const slots = Math.max(minimumSlots, reps.length);
  const gap = slots > 8 ? 6 : 12;
  const barWidth = width > 0 ? (width - gap * (slots - 1)) / slots : 0;
  const maxVelocity = Math.max(mvt * 2.2, ...reps.map((rep) => rep.meanVelocity)) * 1.1;
  const y = (velocity: number) => height - (velocity / maxVelocity) * height;
  const zoneTop = y(mvt);

  const summary = reps
    .map((rep, index) => `rep ${index + 1} ${rep.failed ? "failed" : `${formatVelocity(rep.meanVelocity)} meters per second`}`)
    .join(", ");

  return (
    <View>
      <View
        style={{ height }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Rep speeds: ${summary || "no reps yet"}. Failure zone below ${formatVelocity(mvt)}.`}
      >
        {width > 0 && (
          <Svg width={width} height={height}>
            <Rect x={0} y={zoneTop} width={width} height={height - zoneTop} fill={colors.failureZone} />
            {reps.map((rep, index) => {
              const barHeight = Math.max(4, height - y(rep.meanVelocity));
              return (
                <Rect
                  key={index}
                  x={index * (barWidth + gap)}
                  y={height - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={5}
                  fill={rep.failed ? colors.failureLine : colors.chartLine}
                />
              );
            })}
            <Line x1={0} x2={width} y1={zoneTop} y2={zoneTop} stroke={colors.failureLine} strokeWidth={1.5} strokeDasharray="5 4" />
            <Line x1={0} x2={width} y1={height - 0.5} y2={height - 0.5} stroke={colors.chartGrid} strokeWidth={1} />
          </Svg>
        )}
      </View>
      <View style={[styles.labels, { gap }]} importantForAccessibility="no-hide-descendants">
        {Array.from({ length: slots }, (_, index) => {
          const rep = reps[index];
          return (
            <Text key={index} style={[type.footnote, styles.label, { color: rep?.failed ? colors.failureText : colors.textSecondary }]}>
              {rep ? (rep.failed ? "fail" : formatShortVelocity(rep.meanVelocity)) : "—"}
            </Text>
          );
        })}
      </View>
      <View style={styles.legend} importantForAccessibility="no-hide-descendants">
        <View style={[styles.swatch, { backgroundColor: colors.failureZone, borderColor: colors.failureLine }]} />
        <Text style={[type.footnote, { color: colors.failureText }]}>Failure zone · below {formatVelocity(mvt)} m/s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
  },
  swatch: {
    width: 14,
    height: 10,
    borderRadius: 2,
    borderTopWidth: 1.5,
    borderStyle: "dashed",
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
