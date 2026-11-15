import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ExerciseList } from "@/components/ExerciseList";
import { SearchField } from "@/components/SearchField";
import { useSettings } from "@/context/SettingsContext";
import { provisionalExercises } from "@/data/catalog";
import { spacing } from "@/theme/theme";

export default function LibraryScreen() {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const matches = provisionalExercises.filter((exercise) => exercise.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
      <View style={styles.search}>
        <SearchField placeholder="Search exercises" value={query} onChange={setQuery} />
      </View>
      <ExerciseList
        exercises={matches}
        units={settings.units}
        onSelect={(exercise) => router.push({ pathname: "/exercise/[id]", params: { id: exercise.id } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  search: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
