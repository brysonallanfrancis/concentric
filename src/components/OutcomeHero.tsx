import { StyleSheet, Text, View } from "react-native";
import type { SetOutcome } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";
import { Icon, type IconName } from "./Icon";

type Props = {
  outcome: SetOutcome;
  failedRepNumber: number | null;
  repsLeftEstimate: number;
};

const outcomeTone: Record<SetOutcome, "success" | "info" | "warning"> = {
  verified: "success",
  near: "info",
  quitEarly: "warning",
};

const outcomeIcon: Record<SetOutcome, IconName> = {
  verified: "verified",
  near: "gauge",
  quitEarly: "warning",
};

export const outcomeTitles: Record<SetOutcome, string> = {
  verified: "Verified failure",
  near: "Near failure",
  quitEarly: "Stopped short",
};

export function outcomeMessage(outcome: SetOutcome, failedRepNumber: number | null, repsLeftEstimate: number): string {
  if (outcome === "verified") return `Rep ${failedRepNumber} stalled. Nothing left in the tank.`;
  if (outcome === "near") return "Your last rep was right at your failure speed. That counts.";
  return `Your last rep was still fast. About ${repsLeftEstimate} ${repsLeftEstimate === 1 ? "rep" : "reps"} left in the tank.`;
}

export function OutcomeHero({ outcome, failedRepNumber, repsLeftEstimate }: Props) {
  const colors = useTheme();
  const palette = colors.tones[outcomeTone[outcome]];
  return (
    <View style={[styles.hero, { backgroundColor: palette.background }]} accessible accessibilityRole="summary">
      <Icon name={outcomeIcon[outcome]} size={40} color={palette.icon} />
      <View style={styles.text}>
        <Text style={[type.title, { color: palette.title }]}>{outcomeTitles[outcome]}</Text>
        <Text style={[type.subhead, { color: palette.text }]}>{outcomeMessage(outcome, failedRepNumber, repsLeftEstimate)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 4,
  },
});
