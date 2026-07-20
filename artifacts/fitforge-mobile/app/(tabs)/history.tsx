import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { SessionCard } from '@/components/SessionCard';
import { useListSessions } from '@workspace/api-client-react';

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const { data: sessions, isLoading, isError, refetch, isRefetching } =
    useListSessions({});

  const sorted = [...(sessions ?? [])].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

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

  if (isError) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Could not load history
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

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => String(item.id)}
      scrollEnabled={!!sorted.length}
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
      ListHeaderComponent={
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            History
          </Text>
          {sorted.length > 0 && (
            <Text
              style={[styles.sessionCount, { color: colors.mutedForeground }]}
            >
              {sorted.length} session{sorted.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Feather name="clock" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No sessions yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Start a workout from the Plan tab to see your history here
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const isComplete = !!item.completedAt;
        const handleShare = async () => {
          const duration = item.completedAt
            ? (() => {
                const ms = new Date(item.completedAt).getTime() - new Date(item.startedAt).getTime();
                const m = Math.floor(ms / 60000);
                return `${m}m`;
              })()
            : '';
          await Share.share({
            message: `💪 Just crushed ${item.dayLabel ?? 'a workout'} on LiftIQ AI!\n⏱ ${duration} · 📦 ${item.completedSets} sets\n\nTrack yours → liftiq.ai`,
            title: `${item.dayLabel ?? 'Workout'} — LiftIQ AI`,
          });
        };
        return (
          <View>
            <SessionCard
              dayLabel={item.dayLabel}
              startedAt={item.startedAt}
              completedAt={item.completedAt}
              totalSets={item.totalSets}
              completedSets={item.completedSets}
            />
            {isComplete && (
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.shareBtn,
                  { borderColor: colors.border, backgroundColor: pressed ? colors.muted : 'transparent' },
                ]}
              >
                <Feather name="share-2" size={13} color={colors.primary} />
                <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share</Text>
              </Pressable>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  content: {
    paddingHorizontal: 20,
  },
  pageHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  sessionCount: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  emptyText: {
    fontSize: 14,
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
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: -4,
    marginBottom: 10,
    marginRight: 0,
  },
  shareBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
});
