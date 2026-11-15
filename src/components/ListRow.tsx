import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";
import { Icon } from "./Icon";

type Props = {
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityHint?: string;
  showSeparator?: boolean;
  chevron?: boolean;
  value?: string;
};

export function ListRow({
  title,
  subtitle,
  accessory,
  onPress,
  onLongPress,
  accessibilityHint,
  showSeparator = false,
  chevron = false,
  value,
}: Props) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? colors.surfaceRaised : colors.surface },
        showSeparator && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
      ]}
    >
      <View style={styles.text}>
        <Text style={[type.body, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[type.footnote, { color: colors.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {value && (
        <Text style={[type.body, { color: colors.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {accessory}
      {chevron && <Icon name="chevronRight" size={14} color={colors.chartMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
