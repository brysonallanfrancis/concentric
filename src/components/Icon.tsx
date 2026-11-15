import { SymbolView, type SymbolViewProps } from "expo-symbols";
import type { ColorValue } from "react-native";

const icons = {
  chevronRight: { ios: "chevron.right", android: "chevron_right" },
  check: { ios: "checkmark", android: "check" },
  checkCircle: { ios: "checkmark.circle.fill", android: "check_circle" },
  circle: { ios: "circle", android: "radio_button_unchecked" },
  verified: { ios: "checkmark.seal.fill", android: "verified" },
  gauge: { ios: "gauge.with.needle", android: "speed" },
  warning: { ios: "exclamationmark.triangle.fill", android: "warning" },
  info: { ios: "info.circle.fill", android: "info" },
  close: { ios: "xmark", android: "close" },
  search: { ios: "magnifyingglass", android: "search" },
  arrowUp: { ios: "arrow.up.circle.fill", android: "arrow_circle_up" },
  arrowDown: { ios: "arrow.down.circle.fill", android: "arrow_circle_down" },
  equal: { ios: "equal.circle.fill", android: "drag_handle" },
  waveform: { ios: "waveform.path.ecg", android: "monitor_heart" },
} satisfies Record<string, SymbolViewProps["name"]>;

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  size: number;
  color: ColorValue;
};

export function Icon({ name, size, color }: Props) {
  return <SymbolView name={icons[name]} size={size} tintColor={color} />;
}
