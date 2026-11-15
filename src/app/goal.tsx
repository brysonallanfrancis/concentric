import { router } from "expo-router";
import { ScrollView } from "react-native";
import { GoalForm } from "@/components/GoalForm";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/theme/theme";

export default function GoalScreen() {
  const colors = useTheme();
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.background }}>
      <GoalForm
        initialValues={settings}
        submitTitle="Save"
        onSubmit={(values) => {
          updateSettings(values);
          router.back();
        }}
      />
    </ScrollView>
  );
}
