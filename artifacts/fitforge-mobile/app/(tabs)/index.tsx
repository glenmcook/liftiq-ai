import React from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { StatCard } from '@/components/StatCard';
import { SessionCard } from '@/components/SessionCard';
import { WorkoutDayCard } from '@/components/WorkoutDayCard';
import {
  useGetDashboardSummary,
} from '@workspace/api-client-react';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const { data: summary, isLoading, isError, refetch, isRefetching } =
    useGetDashboardSummary({});

  const topPad = isWeb ? 67 : insets.top;

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

  if (isError || !summary) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Could not load dashboard
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.retryText, { color: colors.primaryForeground }]}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  const nextDay = summary.nextWorkoutDay;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
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
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {greeting()}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            LiftIQ AI
          </Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={14} color={colors.primaryForeground} />
          <Text style={[styles.streakText, { color: colors.primaryForeground }]}>
            {summary.currentStreak}d
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard
          label="Sessions"
          value={summary.totalSessions}
          accent={false}
        />
        <StatCard
          label="This Week"
          value={summary.sessionsThisWeek}
          accent={true}
        />
        <StatCard
          label="Sets"
          value={summary.totalSetsLogged}
          accent={false}
        />
      </View>

      {/* Plan + next workout */}
      {summary.activePlanName && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Active Plan
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/workout')}
              hitSlop={8}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                View all
              </Text>
            </Pressable>
          </View>
          <View
            style={[
              styles.planCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.planName, { color: colors.foreground }]}>
              {summary.activePlanName}
            </Text>
            <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>
              {summary.activePlanDays} training days
            </Text>
          </View>

          {nextDay && (
            <>
              <Text
                style={[styles.nextLabel, { color: colors.mutedForeground }]}
              >
                UP NEXT
              </Text>
              <WorkoutDayCard
                dayNumber={nextDay.dayNumber}
                label={nextDay.label}
                focus={nextDay.focus}
                isNext={true}
                onPress={() => router.push(`/session/${nextDay.id}`)}
              />
            </>
          )}
        </View>
      )}

      {/* Recent sessions */}
      {summary.recentSessions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Recent
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/history')}
              hitSlop={8}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>
          {summary.recentSessions.slice(0, 3).map((s) => (
            <SessionCard
              key={s.id}
              dayLabel={s.dayLabel}
              startedAt={s.startedAt}
              completedAt={s.completedAt}
              totalSets={s.totalSets}
              completedSets={s.completedSets}
            />
          ))}
        </View>
      )}

      {/* PRs stat */}
      {summary.personalRecords > 0 && (
        <View
          style={[
            styles.prBanner,
            { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
          ]}
        >
          <Feather name="award" size={16} color="#92400e" />
          <Text style={[styles.prBannerText, { color: '#92400e' }]}>
            {summary.personalRecords} personal record
            {summary.personalRecords !== 1 ? 's' : ''} set!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  content: {
    paddingHorizontal: 20,
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
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
  seeAll: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  planName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  planMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  nextLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 2,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  prBannerText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
});
