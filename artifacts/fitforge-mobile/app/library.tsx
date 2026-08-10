import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useListExercises } from '@workspace/api-client-react';

const MUSCLE_GROUPS = ['all', 'chest', 'shoulders', 'back', 'biceps', 'triceps', 'legs', 'calves', 'core'];

function getWatchUrl(url: string): string {
  const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  return url;
}

// Only ~18 exercises have a curated videoUrl (a hardcoded map on the
// server from the original template) — the AI generates exercise names
// far beyond that set. Falling back to a YouTube search keeps a working
// video link available for every exercise instead of silently hiding it.
function getVideoLinkUrl(exercise: { name: string; videoUrl?: string | null }): string {
  if (exercise.videoUrl) return getWatchUrl(exercise.videoUrl);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} exercise form tutorial`)}`;
}

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;

  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  const { data: exercises = [], isLoading } = useListExercises({});

  const filtered = useMemo(() => {
    return exercises.filter((ex: any) => {
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(search.toLowerCase()) ||
        (ex.equipment || '').toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscleFilter === 'all' || ex.muscleGroup === muscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [exercises, search, muscleFilter]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.searchBar, { paddingTop: topPad + 12 }]}>
        <View style={[styles.searchInputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises, muscles, equipment..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {MUSCLE_GROUPS.map((g) => {
            const active = muscleFilter === g;
            return (
              <Pressable
                key={g}
                onPress={() => setMuscleFilter(g)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: active ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                >
                  {g}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No exercises found.</Text>
        ) : (
          filtered.map((ex: any) => (
            <Pressable
              key={ex.id}
              onPress={() => setSelected(ex)}
              style={({ pressed }) => [
                styles.exCard,
                { borderColor: colors.border, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                <View style={styles.exTags}>
                  <Text style={[styles.exTag, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>
                    {ex.muscleGroup}
                  </Text>
                  {ex.equipment ? (
                    <Text style={[styles.exTag, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
                      {ex.equipment}
                    </Text>
                  ) : null}
                </View>
              </View>
              <Feather name="play-circle" size={20} color={colors.primary} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{selected?.name}</Text>
              <Pressable onPress={() => setSelected(null)} hitSlop={10}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              <View style={styles.exTags}>
                <Text style={[styles.exTag, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>
                  {selected?.muscleGroup}
                </Text>
                {selected?.equipment ? (
                  <Text style={[styles.exTag, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
                    {selected?.equipment}
                  </Text>
                ) : null}
              </View>
              {selected?.description ? (
                <Text style={[styles.modalDesc, { color: colors.foreground }]}>{selected.description}</Text>
              ) : null}
              {selected?.instructions ? (
                <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>{selected.instructions}</Text>
              ) : null}
            </ScrollView>
            {selected && (
              <Pressable
                onPress={() => Linking.openURL(getVideoLinkUrl(selected))}
                style={[styles.watchBtn, { backgroundColor: colors.primary }]}
              >
                <Feather name="play-circle" size={18} color={colors.primaryForeground} />
                <Text style={[styles.watchBtnText, { color: colors.primaryForeground }]}>
                  {selected.videoUrl ? 'Watch Tutorial' : 'Search Tutorial'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: { paddingHorizontal: 20, paddingBottom: 8, gap: 10 },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  filterRow: { gap: 8, paddingRight: 20 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'capitalize' },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', paddingVertical: 60, fontFamily: 'Inter_400Regular', fontSize: 14 },
  exCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  exName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, marginBottom: 6 },
  exTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exTag: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    textTransform: 'capitalize',
    overflow: 'hidden',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, flex: 1 },
  modalDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21, marginTop: 12 },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  watchBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
