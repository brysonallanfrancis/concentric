import { useColorScheme } from "react-native";

type TonePalette = {
  background: string;
  icon: string;
  title: string;
  text: string;
};

export type Palette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  text: string;
  textSecondary: string;
  separator: string;
  tint: string;
  tintSoft: string;
  tintFill: string;
  onTint: string;
  danger: string;
  segmentTrack: string;
  segmentThumb: string;
  chartLine: string;
  chartGrid: string;
  chartMuted: string;
  failureZone: string;
  failureLine: string;
  failureText: string;
  tones: Record<"info" | "warning" | "success", TonePalette>;
};

export const palettes: Record<"light" | "dark", Palette> = {
  light: {
    background: "#F2F2F7",
    surface: "#FFFFFF",
    surfaceRaised: "#E9E9EE",
    text: "#1C1C1E",
    textSecondary: "#6C6C70",
    separator: "#C6C6C8",
    tint: "#0A60D0",
    tintSoft: "#E8F0FB",
    tintFill: "#0A60D0",
    onTint: "#FFFFFF",
    danger: "#D70015",
    segmentTrack: "#E3E3E8",
    segmentThumb: "#FFFFFF",
    chartLine: "#0A60D0",
    chartGrid: "#D1D1D6",
    chartMuted: "#AEAEB2",
    failureZone: "#FFF1E5",
    failureLine: "#C2570A",
    failureText: "#8A3B00",
    tones: {
      info: { background: "#E8F0FB", icon: "#0A60D0", title: "#0A3F8A", text: "#33496B" },
      warning: { background: "#FFF1E5", icon: "#C2570A", title: "#8A3B00", text: "#6B3A12" },
      success: { background: "#E6F4EA", icon: "#1F7A3A", title: "#1E5E33", text: "#2D4F38" },
    },
  },
  dark: {
    background: "#000000",
    surface: "#1C1C1E",
    surfaceRaised: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "#AEAEB2",
    separator: "#38383A",
    tint: "#4C9BFF",
    tintSoft: "#14263F",
    tintFill: "#1F6FD6",
    onTint: "#FFFFFF",
    danger: "#FF6961",
    segmentTrack: "#2C2C2E",
    segmentThumb: "#636366",
    chartLine: "#4C9BFF",
    chartGrid: "#3A3A3C",
    chartMuted: "#636366",
    failureZone: "#3A2414",
    failureLine: "#FF9F5A",
    failureText: "#FFB27A",
    tones: {
      info: { background: "#14263F", icon: "#4C9BFF", title: "#A9CCFF", text: "#C9DCF5" },
      warning: { background: "#3A2414", icon: "#FF9F5A", title: "#FFC08F", text: "#F2D2B8" },
      success: { background: "#12301C", icon: "#4CD478", title: "#9BE7B1", text: "#C7EBD2" },
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 10,
  lg: 14,
};

export const type = {
  hero: { fontSize: 128, fontWeight: "700", lineHeight: 136, fontVariant: ["tabular-nums"] },
  largeNumber: { fontSize: 64, fontWeight: "700", fontVariant: ["tabular-nums"] },
  metric: { fontSize: 34, fontWeight: "600", fontVariant: ["tabular-nums"] },
  title: { fontSize: 22, fontWeight: "700" },
  headline: { fontSize: 17, fontWeight: "600" },
  body: { fontSize: 17, fontWeight: "400" },
  subhead: { fontSize: 15, fontWeight: "400" },
  subheadStrong: { fontSize: 15, fontWeight: "600" },
  footnote: { fontSize: 13, fontWeight: "400" },
  caption: { fontSize: 12, fontWeight: "500" },
  sectionHeader: { fontSize: 13, fontWeight: "400", textTransform: "uppercase" },
} as const;

export function useTheme(): Palette {
  return palettes[useColorScheme() === "dark" ? "dark" : "light"];
}
