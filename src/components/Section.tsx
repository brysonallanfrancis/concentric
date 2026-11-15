import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme/theme";

type Props = {
  title?: string;
  footer?: string;
  padded?: boolean;
  children: ReactNode;
};

export function Section({ title, footer, padded = false, children }: Props) {
  const colors = useTheme();
  return (
    <View style={styles.container}>
      {title && (
        <Text style={[type.sectionHeader, styles.header, { color: colors.textSecondary }]} accessibilityRole="header">
          {title}
        </Text>
      )}
      <View style={[styles.card, padded && styles.padded, { backgroundColor: colors.surface }]}>{children}</View>
      {footer && <Text style={[type.footnote, styles.footer, { color: colors.textSecondary }]}>{footer}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  header: {
    marginHorizontal: spacing.lg,
    marginBottom: 6,
  },
  card: {
    borderRadius: radius.md,
    overflow: "hidden",
  },
  padded: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    marginHorizontal: spacing.lg,
    marginTop: 6,
  },
});
