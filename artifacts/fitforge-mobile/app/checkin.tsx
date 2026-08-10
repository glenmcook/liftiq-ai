import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useListCheckins, useCreateCheckin } from '@workspace/api-client-react';

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CheckinScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;
  const queryClient = useQueryClient();

  const { data: checkins, isLoading } = useListCheckins();
  const createCheckin = useCreateCheckin();

  const [notes, setNotes] = useState('');
  const [feeling, setFeeling] = useState(7);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      Alert.alert('Add a note', 'Report how you’re feeling before submitting.');
      return;
    }
    try {
      await createCheckin.mutateAsync({ data: { userNotes: notes, feelingScore: feeling } });
      setNotes('');
      setFeeling(7);
      queryClient.invalidateQueries({ queryKey: ['/api/checkins'] });
    } catch {
      Alert.alert('Error', 'Could not submit check-in. Please try again.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.scoreHeader}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Readiness Score</Text>
          <Text style={[styles.scoreBadge, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>
            {feeling} / 10
          </Text>
        </View>
        <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
          How ready does your body feel to train today? Be honest — the AI uses this to decide whether to
          adjust your program.
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scoreRow}>
          {SCORES.map((n) => {
            const active = feeling === n;
            return (
              <Pressable
                key={n}
                onPress={() => setFeeling(n)}
                style={[
                  styles.scoreDot,
                  { backgroundColor: active ? colors.primary : colors.background, borderColor: active ? colors.primary : colors.border },
                ]}
              >
                <Text style={{ color: active ? colors.primaryForeground : colors.foreground, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const }}>
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.formTitle, { color: colors.foreground, marginTop: 8 }]}>Status Report</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Report any soreness, fatigue, or performance notes..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={5}
          style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={createCheckin.isPending}
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        >
          {createCheckin.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather name="send" size={16} color={colors.primaryForeground} />
              <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>Submit Check-in</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : checkins?.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No check-ins logged yet.</Text>
        ) : (
          checkins?.map((checkin: any) => (
            <View key={checkin.id} style={[styles.checkinCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={styles.checkinHeader}>
                <Text style={[styles.checkinDate, { color: colors.mutedForeground }]}>
                  {new Date(checkin.checkinDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.checkinScore, { color: colors.primary }]}>
                  {checkin.feelingScore}/10
                </Text>
              </View>
              {checkin.userNotes ? (
                <Text style={[styles.checkinNotes, { color: colors.foreground }]}>{checkin.userNotes}</Text>
              ) : null}
              {checkin.aiResponse ? (
                <View style={[styles.aiBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                  <View style={styles.aiLabel}>
                    <Feather name="zap" size={12} color={colors.primary} />
                    <Text style={[styles.aiLabelText, { color: colors.primary }]}>AI ANALYSIS</Text>
                  </View>
                  <Text style={[styles.aiText, { color: colors.foreground }]}>{checkin.aiResponse}</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 24 },
  formCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 12 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  scoreBadge: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
  helperText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  scoreRow: { gap: 8, paddingVertical: 4 },
  scoreDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular', minHeight: 100, textAlignVertical: 'top' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  submitBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  empty: { textAlign: 'center', paddingVertical: 40, fontFamily: 'Inter_400Regular', fontSize: 14 },
  checkinCard: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 10, marginBottom: 10 },
  checkinHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkinDate: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  checkinScore: { fontSize: 13, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  checkinNotes: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  aiBox: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 6 },
  aiLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiLabelText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, letterSpacing: 0.5 },
  aiText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
});
