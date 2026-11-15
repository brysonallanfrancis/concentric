import { router, Stack } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ExerciseList } from "@/components/ExerciseList";
import { SearchField } from "@/components/SearchField";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useSettings } from "@/context/SettingsContext";
import { kindInfo, provisionalExercises } from "@/data/catalog";
import type { ExerciseKind } from "@/models/types";
import { spacing, type, useTheme } from "@/theme/theme";

type Filter = "all" | ExerciseKind;

export default function PickExerciseScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const matches = provisionalExercises.filter(
    (exercise) =>
      (filter === "all" || exercise.kind === filter) && exercise.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
              <Text style={[type.body, { color: colors.tint }]}>Cancel</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.controls}>
        <SearchField placeholder="Search exercises" value={query} onChange={setQuery} />
        <SegmentedControl<Filter>
          label="Exercise type"
          options={[
            { value: "all", label: "All" },
            { value: "barbell", label: kindInfo.barbell.title },
            { value: "bodyweight", label: kindInfo.bodyweight.title },
            { value: "machine", label: kindInfo.machine.title },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </View>
      <ExerciseList
        exercises={matches}
        units={settings.units}
        onSelect={(exercise) => router.push({ pathname: "/set/setup", params: { exerciseId: exercise.id } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  controls: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
});
