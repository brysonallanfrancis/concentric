import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@/theme/theme";
import { Icon } from "./Icon";

type Props = {
  label: string;
  onPress: () => void;
};

export function HeaderCloseButton({ label, onPress }: Props) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={[styles.button, { backgroundColor: colors.surfaceRaised }]}
    >
      <Icon name="close" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
