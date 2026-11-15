import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  label: string;
  value: number;
  step: number;
  min?: number;
  unit?: string;
  format?: (value: number) => string;
  onChange: (value: number) => void;
  showSeparator?: boolean;
};

export function StepperRow({ label, value, step, min = 0, unit, format, onChange, showSeparator = false }: Props) {
  const colors = useTheme();
  const display = format ? format(value) : unit ? `${value} ${unit}` : `${value}`;

  return (
    <View
      style={[
        styles.row,
        showSeparator && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
      ]}
    >
      <Text style={[type.body, { color: colors.text }]}>{label}</Text>
      <View
        style={styles.controls}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: display }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) =>
          onChange(event.nativeEvent.actionName === "increment" ? value + step : Math.max(min, value - step))
        }
      >
        <StepButton symbol="−" disabled={value <= min} onPress={() => onChange(Math.max(min, value - step))} />
        <Text style={[type.headline, styles.value, { color: colors.text }]}>{display}</Text>
        <StepButton symbol="+" onPress={() => onChange(value + step)} />
      </View>
    </View>
  );
}

function StepButton({ symbol, disabled = false, onPress }: { symbol: string; disabled?: boolean; onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      importantForAccessibility="no"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surfaceRaised, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  button: {
    width: 44,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: {
    fontSize: 22,
  },
  value: {
    minWidth: 72,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
