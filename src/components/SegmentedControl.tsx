import { Pressable, StyleSheet, Text, View } from "react-native";
import { type, useTheme } from "@/theme/theme";

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const colors = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.segmentTrack }]} accessibilityRole="tablist" accessibilityLabel={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && [styles.selected, { backgroundColor: colors.segmentThumb }]]}
          >
            <Text style={[type.footnote, { color: colors.text, fontWeight: selected ? "600" : "400" }]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    padding: 2,
    borderRadius: 9,
    gap: 2,
  },
  segment: {
    flex: 1,
    minHeight: 32,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  selected: {
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
