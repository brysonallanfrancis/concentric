import { StyleSheet, Text, View } from "react-native";
import { type, useTheme } from "@/theme/theme";

type Props = {
  title: string;
  subtitle: string;
};

export function LiveHeaderTitle({ title, subtitle }: Props) {
  const colors = useTheme();
  return (
    <View style={styles.container} accessible accessibilityRole="header" accessibilityLabel={`${title}. ${subtitle}`}>
      <Text style={[type.headline, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[type.footnote, { color: colors.textSecondary }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
});
