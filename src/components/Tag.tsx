import { StyleSheet, Text } from "react-native";
import { type, useTheme } from "@/theme/theme";

type Props = {
  label: string;
};

export function Tag({ label }: Props) {
  const colors = useTheme();
  return <Text style={[type.caption, styles.tag, { color: colors.textSecondary, backgroundColor: colors.surfaceRaised }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: "hidden",
  },
});
