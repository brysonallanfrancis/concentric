import { StyleSheet, Switch, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  showSeparator?: boolean;
};

export function ToggleRow({ label, value, onChange, showSeparator = false }: Props) {
  const colors = useTheme();
  return (
    <View
      style={[
        styles.row,
        showSeparator && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
      ]}
    >
      <Text style={[type.body, styles.label, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={label} trackColor={{ true: colors.tint }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    marginRight: spacing.md,
  },
});
