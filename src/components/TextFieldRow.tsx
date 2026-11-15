import { StyleSheet, TextInput } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function TextFieldRow({ placeholder, value, onChange }: Props) {
  const colors = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      accessibilityLabel={placeholder}
      multiline
      style={[type.body, styles.input, { color: colors.text }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 88,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    textAlignVertical: "top",
  },
});
