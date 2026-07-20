import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}

export function StatCard({ label, value, unit, accent = false }: StatCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: accent ? colors.primary : colors.card,
          borderColor: accent ? colors.primary : colors.cardBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.value,
          { color: accent ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {value}
        {unit && (
          <Text
            style={[
              styles.unit,
              { color: accent ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            {' '}{unit}
          </Text>
        )}
      </Text>
      <Text
        style={[
          styles.label,
          { color: accent ? colors.primaryForeground : colors.mutedForeground },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minWidth: 90,
  },
  value: {
    fontSize: 26,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    lineHeight: 30,
  },
  unit: {
    fontSize: 13,
    fontWeight: '400' as const,
    fontFamily: 'Inter_400Regular',
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
