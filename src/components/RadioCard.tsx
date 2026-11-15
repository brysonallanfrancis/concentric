import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme/theme";
import { Icon } from "./Icon";

type Props = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export function RadioCard({ title, description, selected, onPress }: Props) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: selected ? colors.tint : "transparent", opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.text}>
        <Text style={[type.headline, { color: colors.text }]}>{title}</Text>
        <Text style={[type.subhead, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Icon name={selected ? "checkCircle" : "circle"} size={24} color={selected ? colors.tint : colors.separator} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  text: {
    flex: 1,
    gap: 3,
  },
});
