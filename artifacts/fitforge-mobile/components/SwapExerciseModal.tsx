import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useListExercises } from '@workspace/api-client-react';

interface SwapExerciseModalProps {
  visible: boolean;
  currentExerciseId: number;
  muscleGroup: string;
  onSelect: (exercise: any) => void;
  onClose: () => void;
}

export function SwapExerciseModal({
  visible,
  currentExerciseId,
  muscleGroup,
  onSelect,
  onClose,
}: SwapExerciseModalProps) {
  const colors = useColors();
  const [search, setSearch] = useState('');

  const { data: allExercises = [], isLoading } = useListExercises(
    {},
    { query: { queryKey: ['exercises'], enabled: visible } }
  );

  const alternates = useMemo(() => {
    return allExercises.filter((ex) => {
      if (ex.id === currentExerciseId) return false;
      if (ex.muscleGroup !== muscleGroup) return false;
      if (!search.trim()) return true;
      return (
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.equipment ?? '').toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [allExercises, currentExerciseId, muscleGroup, search]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.tag, { color: colors.primary }]}>MACHINE BUSY</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>Swap Exercise</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {muscleGroup} · session only
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { borderBottomColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            autoFocus
          />
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : alternates.length === 0 ? (
          <View style={styles.centered}>
            <Feather name="activity" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No alternatives found</Text>
          </View>
        ) : (
          <FlatList
            data={alternates}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item); setSearch(''); }}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: pressed ? colors.primary + '10' : colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowName, { color: colors.foreground }]}>{item.name}</Text>
                  <View style={styles.rowMeta}>
                    {item.equipment ? (
                      <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{item.equipment}</Text>
                      </View>
                    ) : null}
                    {item.category ? (
                      <Text style={[styles.category, { color: colors.mutedForeground }]}>{item.category}</Text>
                    ) : null}
                  </View>
                </View>
                <Feather name="arrow-right" size={16} color={colors.primary} />
              </Pressable>
            )}
          />
        )}

        {/* Footer note */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Swap applies to this session only — your program resets next time.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  tag: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  list: {
    padding: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowInfo: { flex: 1 },
  rowName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginBottom: 4,
  },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  category: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textTransform: 'capitalize',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
