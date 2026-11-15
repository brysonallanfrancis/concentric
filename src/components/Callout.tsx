import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme/theme";
import { Icon, type IconName } from "./Icon";

type Tone = "info" | "warning" | "success";

type Props = {
  tone: Tone;
  title?: string;
  message: string;
  alert?: boolean;
  children?: ReactNode;
};

const toneIcons: Record<Tone, IconName> = { info: "info", warning: "warning", success: "verified" };

export function Callout({ tone, title, message, alert = false, children }: Props) {
  const colors = useTheme();
  const palette = colors.tones[tone];
  return (
    <View
      style={[styles.callout, { backgroundColor: palette.background }]}
      accessibilityRole={alert ? "alert" : undefined}
      accessibilityLiveRegion={alert ? "assertive" : undefined}
    >
      <View style={styles.body}>
        <Icon name={toneIcons[tone]} size={20} color={palette.icon} />
        <View style={styles.text}>
          {title && <Text style={[type.subheadStrong, { color: palette.title }]}>{title}</Text>}
          <Text style={[type.footnote, { color: palette.text }]}>{message}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  callout: {
    borderRadius: radius.lg,
    padding: spacing.md,
    paddingHorizontal: 14,
    gap: spacing.md,
  },
  body: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
