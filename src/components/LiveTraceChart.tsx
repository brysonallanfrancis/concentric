import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";
import { useTheme } from "@/theme/theme";

type Props = {
  values: number[];
  capacity: number;
  range: number;
  height?: number;
  accessibilityLabel: string;
};

export function LiveTraceChart({ values, capacity, range, height = 160, accessibilityLabel }: Props) {
  const colors = useTheme();
  const [width, setWidth] = useState(0);

  const middle = height / 2;
  const points = values
    .map((value, index) => {
      const x = (index / (capacity - 1)) * width;
      const clamped = Math.max(-range, Math.min(range, value));
      const y = middle - (clamped / range) * middle;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} x2={width} y1={middle} y2={middle} stroke={colors.chartGrid} strokeWidth={1} />
          <Polyline points={points} fill="none" stroke={colors.chartLine} strokeWidth={2} strokeLinejoin="round" />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
