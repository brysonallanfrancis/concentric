import * as Haptics from "expo-haptics";

export function repTap(enabled: boolean) {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function successBuzz(enabled: boolean) {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function warningBuzz(enabled: boolean) {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function failureBuzz(enabled: boolean) {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
