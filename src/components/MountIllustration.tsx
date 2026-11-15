import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { mountInfo } from "@/data/catalog";
import type { MountType } from "@/models/types";
import { radius, useTheme } from "@/theme/theme";

type Props = {
  mount: MountType;
};

export function MountIllustration({ mount }: Props) {
  const colors = useTheme();
  const ink = colors.text;
  const accent = colors.tint;
  const soft = colors.tintSoft;

  return (
    <View
      style={[styles.frame, { borderColor: colors.separator, backgroundColor: colors.background }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Illustration: phone placement, ${mountInfo[mount].label.toLowerCase()}`}
    >
      <Svg width={260} height={110} viewBox="0 0 260 110" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {mount === "forearm" && (
          <>
            <Path d="M24 44 Q110 38 200 48" stroke={ink} strokeWidth={2} />
            <Path d="M24 78 Q110 82 200 72" stroke={ink} strokeWidth={2} />
            <Path d="M24 44 Q8 61 24 78" stroke={ink} strokeWidth={2} />
            <Rect x={200} y={42} width={38} height={36} rx={10} stroke={ink} strokeWidth={2} />
            <Path d="M250 60H182" stroke={colors.chartMuted} strokeWidth={1.5} strokeDasharray="2 4" />
            <Rect x={86} y={34} width={72} height={54} rx={6} stroke={accent} strokeWidth={2} />
            <Rect x={100} y={42} width={44} height={38} rx={5} stroke={accent} strokeWidth={2.5} fill={soft} />
            <VerticalArrows x={244} color={accent} />
          </>
        )}
        {mount === "upperArm" && (
          <>
            <Circle cx={60} cy={30} r={14} stroke={ink} strokeWidth={2} />
            <Path d="M60 44 V96 M60 54 Q90 60 104 90 M60 54 Q30 64 26 92" stroke={ink} strokeWidth={2} />
            <Rect x={74} y={58} width={22} height={28} rx={4} stroke={accent} strokeWidth={2.5} fill={soft} transform="rotate(-30 85 72)" />
            <VerticalArrows x={150} color={accent} />
          </>
        )}
        {mount === "chest" && (
          <>
            <Circle cx={130} cy={22} r={14} stroke={ink} strokeWidth={2} />
            <Path d="M100 44 Q130 36 160 44 L156 104 H104 Z" stroke={ink} strokeWidth={2} />
            <Path d="M100 62 H160" stroke={accent} strokeWidth={3} />
            <Rect x={116} y={52} width={28} height={40} rx={5} stroke={accent} strokeWidth={2.5} fill={soft} />
            <VerticalArrows x={210} color={accent} />
          </>
        )}
        {mount === "bar" && (
          <>
            <Path d="M10 60 H250" stroke={ink} strokeWidth={4} />
            <Rect x={20} y={30} width={14} height={60} rx={3} stroke={ink} strokeWidth={2} />
            <Rect x={226} y={30} width={14} height={60} rx={3} stroke={ink} strokeWidth={2} />
            <Rect x={150} y={48} width={40} height={24} rx={5} stroke={accent} strokeWidth={2.5} fill={soft} />
            <VerticalArrows x={110} color={accent} />
          </>
        )}
        {mount === "stack" && (
          <>
            <Path d="M70 10 V104 M190 10 V104" stroke={colors.chartMuted} strokeWidth={2} />
            {[0, 1, 2, 3].map((index) => (
              <Rect key={index} x={80} y={44 + index * 15} width={100} height={12} rx={2} stroke={ink} strokeWidth={2} />
            ))}
            <Rect x={110} y={20} width={40} height={22} rx={5} stroke={accent} strokeWidth={2.5} fill={soft} />
            <VerticalArrows x={230} color={accent} />
          </>
        )}
      </Svg>
    </View>
  );
}

function VerticalArrows({ x, color }: { x: number; color: string }) {
  return (
    <>
      <Path d={`M${x} 32 V8 M${x - 6} 14 L${x} 8 L${x + 6} 14`} stroke={color} strokeWidth={2} />
      <Path d={`M${x} 88 V102 M${x - 6} 96 L${x} 102 L${x + 6} 96`} stroke={color} strokeWidth={2} />
    </>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 132,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
