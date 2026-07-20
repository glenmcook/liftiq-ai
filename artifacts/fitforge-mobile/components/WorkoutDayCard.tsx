import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface WorkoutDayCardProps {
  dayNumber: number;
  label: string;
  focus: string;
  onPress: () => void;
  isNext?: boolean;
}

const FOCUS_ICONS: Record<string, { name: string; lib: 'feather' | 'mci' }> = {
  pull: { name: 'trending-down', lib: 'feather' },
  push: { name: 'trending-up', lib: 'feather' },
  legs: { name: 'run-fast', lib: 'mci' },
  full_body: { name: 'activity', lib: 'feather' },
  cardio: { name: 'heart', lib: 'feather' },
  rest: { name: 'moon', lib: 'feather' },
};

const FOCUS_LABEL: Record<string, string> = {
  pull: 'Pull',
  push: 'Push',
  legs: 'Legs',
  full_body: 'Full Body',
  cardio: 'Cardio',
  rest: 'Rest',
};

export function WorkoutDayCard({
  dayNumber,
  label,
  focus,
  onPress,
  isNext = false,
}: WorkoutDayCardProps) {
  const colors = useColors();
  const iconInfo = FOCUS_ICONS[focus] ?? { name: 'activity', lib: 'feather' };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isNext ? colors.primary : colors.card,
          borderColor: isNext ? colors.primary : colors.cardBorder,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: isNext ? 'rgba(255,255,255,0.2)' : colors.accent },
          ]}
        >
          {iconInfo.lib === 'feather' ? (
            <Feather
              name={iconInfo.name as any}
              size={18}
              color={isNext ? colors.primaryForeground : colors.primary}
            />
          ) : (
            <MaterialCommunityIcons
              name={iconInfo.name as any}
              size={18}
              color={isNext ? colors.primaryForeground : colors.primary}
            />
          )}
        </View>
        <View style={styles.textGroup}>
          <Text
            style={[
              styles.label,
              { color: isNext ? colors.primaryForeground : colors.foreground },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.focus,
              {
                color: isNext
                  ? 'rgba(255,255,255,0.75)'
                  : colors.mutedForeground,
              },
            ]}
          >
            Day {dayNumber} · {FOCUS_LABEL[focus] ?? focus}
          </Text>
        </View>
      </View>
      <Feather
        name="chevron-right"
        size={18}
        color={isNext ? 'rgba(255,255,255,0.75)' : colors.mutedForeground}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  focus: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
