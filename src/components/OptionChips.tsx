import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";

type Props<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  scrolls?: boolean;
};

export function OptionChips<T extends string>({ label, options, value, onChange, scrolls = false }: Props<T>) {
  const colors = useTheme();
  const chips = options.map((option) => {
    const selected = option === value;
    return (
      <Pressable
        key={option}
        onPress={() => onChange(option)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        style={({ pressed }) => [
          styles.chip,
          { backgroundColor: selected ? colors.tintFill : colors.surfaceRaised, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[type.subhead, { color: selected ? colors.onTint : colors.text, fontWeight: selected ? "600" : "400" }]}>
          {option}
        </Text>
      </Pressable>
    );
  });

  if (scrolls) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
      >
        {chips}
      </ScrollView>
    );
  }

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {chips}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 22,
    justifyContent: "center",
  },
});
