import { Pressable, StyleSheet, Text } from "react-native";
import { radius, type, useTheme } from "@/theme/theme";

type Variant = "filled" | "tinted" | "dark" | "destructive";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  large?: boolean;
};

export function PrimaryButton({ title, onPress, variant = "filled", disabled = false, large = false }: Props) {
  const colors = useTheme();
  const palette: Record<Variant, { background: string; text: string }> = {
    filled: { background: colors.tintFill, text: colors.onTint },
    tinted: { background: colors.surfaceRaised, text: colors.tint },
    dark: { background: colors.text, text: colors.background },
    destructive: { background: colors.surfaceRaised, text: colors.danger },
  };
  const { background, text } = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { height: large ? 56 : 50, backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[type.headline, { color: text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
