import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { WorkoutDayCard } from '@/components/WorkoutDayCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useOfflinePlan } from '@/hooks/useOfflinePlan';

const PLAN_TYPE_LABELS: Record<string, string> = {
  ppl: 'Push / Pull / Legs',
  full_body: 'Full Body',
  upper_lower: 'Upper / Lower',
};

export default function WorkoutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const { plan, isLoading, isError, isOffline, refetch, isRefetching } = useOfflinePlan();

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !plan) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Feather name="calendar" size={40} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
          No Active Plan
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
          Generate a plan from the web app to get started
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Offline indicator — shown below safe area, above content */}
      {isOffline && <View style={{ paddingTop: topPad }}><OfflineBanner /></View>}

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: isOffline ? 16 : topPad + 16,
            paddingBottom: isWeb ? 100 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            My Plan
          </Text>
        </View>

        {/* Plan card */}
        <View
          style={[
            styles.planCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.planCardTop}>
            <View
              style={[styles.planIcon, { backgroundColor: colors.accent }]}
            >
              <Feather name="layers" size={20} color={colors.primary} />
            </View>
            <View style={styles.planInfo}>
              <Text style={[styles.planName, { color: colors.foreground }]}>
                {plan.name}
              </Text>
              <Text style={[styles.planType, { color: colors.mutedForeground }]}>
                {PLAN_TYPE_LABELS[plan.planType] ?? plan.planType}
              </Text>
            </View>
            <View
              style={[
                styles.activeBadge,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.activeText, { color: colors.primary }]}>
                Active
              </Text>
            </View>
          </View>
          {plan.description ? (
            <Text
              style={[styles.planDescription, { color: colors.mutedForeground }]}
            >
              {plan.description}
            </Text>
          ) : null}
        </View>

        {/* Days */}
        <View style={styles.daysHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Training Days
          </Text>
          <Text style={[styles.dayCount, { color: colors.mutedForeground }]}>
            {plan.days.length} days
          </Text>
        </View>

        {plan.days.map((day) => (
          <WorkoutDayCard
            key={day.id}
            dayNumber={day.dayNumber}
            label={day.label}
            focus={day.focus}
            onPress={() => router.push(`/session/${day.id}`)}
          />
        ))}

        {plan.aiNotes ? (
          <View
            style={[
              styles.notesCard,
              { backgroundColor: colors.accent, borderColor: colors.border },
            ]}
          >
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.notesText, { color: colors.foreground }]}>
              {plan.aiNotes}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  pageHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  planType: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  planDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  dayCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  notesCard: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
