import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

type Macros = { calories: number; proteinG: number; carbsG: number; fatG: number; goal: string };
type MealItem = { meal: string; time: string; foods: string[]; macros: Macros; notes?: string };
type Recommendations = {
  macros: Macros;
  mealPlan: MealItem[];
  tips: string[];
  dietaryPreference: string;
  allergies: string;
};
type Prefs = { dietaryPreference: string; allergies: string | null; calorieOverride: number | null };

const DIET_OPTIONS = ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo'];

function MealCard({ meal, colors }: { meal: MealItem; colors: ReturnType<typeof useColors> }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.mealCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.mealHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mealName, { color: colors.foreground }]}>{meal.meal}</Text>
          <Text style={[styles.mealMeta, { color: colors.mutedForeground }]}>
            {meal.time} · {meal.macros?.calories ?? '—'} kcal · {meal.macros?.proteinG ?? '—'}g P
          </Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
      </Pressable>
      {open && (
        <View style={styles.mealBody}>
          {meal.foods.map((f, i) => (
            <Text key={i} style={[styles.foodItem, { color: colors.foreground }]}>
              • {f}
            </Text>
          ))}
          {meal.notes ? (
            <Text style={[styles.mealNotes, { color: colors.mutedForeground }]}>{meal.notes}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function DietScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;
  const qc = useQueryClient();

  const [showPrefs, setShowPrefs] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Partial<Prefs>>({});

  const { data: prefs } = useQuery<Prefs>({
    queryKey: ['/api/diet/preferences'],
    queryFn: () => customFetch<Prefs>('/api/diet/preferences'),
  });

  const { data: recs, isLoading, isFetching, refetch } = useQuery<Recommendations>({
    queryKey: ['/api/diet/recommendations'],
    queryFn: () => customFetch<Recommendations>('/api/diet/recommendations'),
    staleTime: Infinity,
  });

  const handleRegenerate = () => {
    customFetch<Recommendations>('/api/diet/recommendations?refresh=true').then((data: Recommendations) => {
      qc.setQueryData(['/api/diet/recommendations'], data);
    });
  };

  const savePrefs = useMutation({
    mutationFn: (data: Partial<Prefs>) =>
      customFetch('/api/diet/preferences', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/diet/preferences'] });
      qc.invalidateQueries({ queryKey: ['/api/diet/recommendations'] });
      setShowPrefs(false);
    },
  });

  const openPrefs = () => {
    setLocalPrefs({
      dietaryPreference: prefs?.dietaryPreference ?? 'omnivore',
      allergies: prefs?.allergies ?? null,
      calorieOverride: prefs?.calorieOverride ?? null,
    });
    setShowPrefs(true);
  };

  const macros = recs?.macros;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.actionRow}>
        <Pressable onPress={openPrefs} style={[styles.actionBtn, { borderColor: colors.border }]}>
          <Feather name="settings" size={14} color={colors.mutedForeground} />
          <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Preferences</Text>
        </Pressable>
        <Pressable
          onPress={handleRegenerate}
          disabled={isFetching}
          style={[styles.actionBtn, { borderColor: colors.border }]}
        >
          <Feather name="refresh-cw" size={14} color={isFetching ? colors.primary : colors.mutedForeground} />
          <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Regenerate</Text>
        </Pressable>
      </View>

      {showPrefs && (
        <View style={[styles.prefsCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Dietary Preferences</Text>
            <Pressable onPress={() => setShowPrefs(false)} hitSlop={8}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Diet Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DIET_OPTIONS.map((o) => {
              const active = (localPrefs.dietaryPreference ?? 'omnivore') === o;
              return (
                <Pressable
                  key={o}
                  onPress={() => setLocalPrefs((p) => ({ ...p, dietaryPreference: o }))}
                  style={[
                    styles.dietPill,
                    { backgroundColor: active ? colors.primary : colors.background, borderColor: active ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={{ color: active ? colors.primaryForeground : colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 13, textTransform: 'capitalize' }}>
                    {o}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 8 }]}>Allergies / Restrictions</Text>
          <TextInput
            value={localPrefs.allergies ?? ''}
            onChangeText={(v) => setLocalPrefs((p) => ({ ...p, allergies: v || null }))}
            placeholder="e.g. dairy, gluten, nuts"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.textInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
          />
          <Pressable
            onPress={() => savePrefs.mutate(localPrefs)}
            disabled={savePrefs.isPending}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            {savePrefs.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save & Recalculate</Text>
            )}
          </Pressable>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.helperText, { color: colors.primary, marginTop: 12 }]}>
            AI is building your fuel protocol...
          </Text>
        </View>
      )}

      {recs && macros && (
        <>
          <View style={styles.macroGrid}>
            <View style={[styles.macroBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>Calories</Text>
              <Text style={[styles.macroValue, { color: colors.foreground }]}>{macros.calories}</Text>
            </View>
            <View style={[styles.macroBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>Protein</Text>
              <Text style={[styles.macroValue, { color: colors.foreground }]}>{macros.proteinG}g</Text>
            </View>
            <View style={[styles.macroBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>Carbs</Text>
              <Text style={[styles.macroValue, { color: colors.foreground }]}>{macros.carbsG}g</Text>
            </View>
            <View style={[styles.macroBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>Fat</Text>
              <Text style={[styles.macroValue, { color: colors.foreground }]}>{macros.fatG}g</Text>
            </View>
          </View>

          {recs.mealPlan?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Meal Plan</Text>
              <View style={{ gap: 10 }}>
                {recs.mealPlan.map((meal, i) => (
                  <MealCard key={i} meal={meal} colors={colors} />
                ))}
              </View>
            </View>
          )}

          {recs.tips?.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nutrition Tips</Text>
              <View style={{ gap: 8 }}>
                {recs.tips.map((tip, i) => (
                  <View key={i} style={[styles.tipCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Feather name="zap" size={14} color={colors.primary} />
                    <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 10 },
  actionBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  prefsCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 10 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  fieldLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  dietPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  textInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, fontFamily: 'Inter_400Regular' },
  saveBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  saveBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  loadingBlock: { alignItems: 'center', paddingVertical: 50 },
  helperText: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  macroBox: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  macroLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  macroValue: { fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  mealCard: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  mealName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  mealMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  mealBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  foodItem: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  mealNotes: { fontSize: 12, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginTop: 4 },
  tipCard: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
});
