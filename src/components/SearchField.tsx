import { StyleSheet, TextInput, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";
import { Icon } from "./Icon";

type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ placeholder, value, onChange }: Props) {
  const colors = useTheme();
  return (
    <View style={[styles.field, { backgroundColor: colors.segmentTrack }]}>
      <Icon name="search" size={16} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel={placeholder}
        clearButtonMode="while-editing"
        autoCorrect={false}
        returnKeyType="search"
        style={[type.body, styles.input, { color: colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 38,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
