import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface SessionCardProps {
  dayLabel: string;
  startedAt: string;
  completedAt?: string | null;
  totalSets: number;
  completedSets: number;
  personalRecords?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function SessionCard({
  dayLabel,
  startedAt,
  completedAt,
  totalSets,
  completedSets,
  personalRecords = 0,
}: SessionCardProps) {
  const colors = useColors();
  const isComplete = !!completedAt;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.label, { color: colors.foreground }]} numberOfLines={1}>
            {dayLabel}
          </Text>
          {isComplete && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Feather name="check" size={11} color={colors.primary} />
            </View>
          )}
          {personalRecords > 0 && (
            <View style={[styles.prBadge, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.prText, { color: '#92400e' }]}>PR</Text>
            </View>
          )}
        </View>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {formatDate(startedAt)}
          {isComplete && `  ·  ${formatDuration(startedAt, completedAt!)}`}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {completedSets}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            sets
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${Math.round(progress * 100)}%` as any },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  label: {
    fontSize: 15,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prText: {
    fontSize: 10,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    width: 32,
    textAlign: 'right',
  },
});
