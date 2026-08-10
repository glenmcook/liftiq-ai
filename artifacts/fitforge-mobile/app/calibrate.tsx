import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import {
  useGetProfile,
  useSaveProfile,
  useGeneratePlan,
} from '@workspace/api-client-react';

const GOALS = [
  { value: 'lose_fat', label: 'Lose Fat' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'athletic_performance', label: 'Athletic Performance' },
  { value: 'general_fitness', label: 'General Fitness' },
];

const EXPERIENCE = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

interface FormState {
  age: string;
  gender: string;
  weightLbs: string;
  heightInches: string;
  fitnessGoal: string;
  experienceLevel: string;
  currentActivities: string;
  daysPerWeek: string;
  splitPreference: string;
}

const DEFAULT_FORM: FormState = {
  age: '30',
  gender: 'male',
  weightLbs: '180',
  heightInches: '70',
  fitnessGoal: 'build_muscle',
  experienceLevel: 'intermediate',
  currentActivities: '',
  daysPerWeek: '4',
  splitPreference: '',
};

type Colors = ReturnType<typeof useColors>;

function SectionLabel({ children, colors }: { children: string; colors: Colors }) {
  return <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{children}</Text>;
}

function FieldLabel({ children, colors }: { children: string; colors: Colors }) {
  return <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{children}</Text>;
}

function ChipRow({
  options,
  value,
  onChange,
  colors,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  colors: Colors;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.primaryForeground : colors.foreground },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CalibrateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: profile, isLoading: profileLoading } = useGetProfile(
    {},
    { query: { retry: false } }
  );
  const saveProfile = useSaveProfile();
  const generatePlan = useGeneratePlan();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [hydrated, setHydrated] = useState(false);

  // Pre-fill from the existing profile (recalibrate case). On first run
  // profileLoading resolves with no data (404) and we just keep the defaults.
  useEffect(() => {
    if (!profileLoading && !hydrated) {
      if (profile) {
        setForm({
          age: String(profile.age),
          gender: profile.gender,
          weightLbs: profile.weightLbs != null ? String(profile.weightLbs) : '',
          heightInches: profile.heightInches != null ? String(profile.heightInches) : '',
          fitnessGoal: profile.fitnessGoal,
          experienceLevel: profile.experienceLevel,
          currentActivities: profile.currentActivities ?? '',
          daysPerWeek: String(profile.daysPerWeek),
          splitPreference: profile.splitPreference ?? '',
        });
      }
      setHydrated(true);
    }
  }, [profileLoading, profile, hydrated]);

  const isFirstRun = !profileLoading && !profile;
  const isPending = saveProfile.isPending || generatePlan.isPending;

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const handleSubmit = async () => {
    const age = parseInt(form.age, 10);
    const weightLbs = parseFloat(form.weightLbs);
    const heightInches = parseFloat(form.heightInches);
    const daysPerWeek = parseInt(form.daysPerWeek, 10);

    if (!age || age <= 0) {
      Alert.alert('Missing info', 'Please enter a valid age.');
      return;
    }
    if (!daysPerWeek || daysPerWeek < 1 || daysPerWeek > 7) {
      Alert.alert('Missing info', 'Days per week must be between 1 and 7.');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        data: {
          age,
          gender: form.gender,
          weightLbs: Number.isFinite(weightLbs) && weightLbs > 0 ? weightLbs : undefined,
          heightInches: Number.isFinite(heightInches) && heightInches > 0 ? heightInches : undefined,
          fitnessGoal: form.fitnessGoal,
          experienceLevel: form.experienceLevel,
          currentActivities: form.currentActivities || undefined,
          daysPerWeek,
          splitPreference: form.splitPreference || undefined,
        },
      });
      await generatePlan.mutateAsync(undefined as unknown as void);
      Alert.alert('Plan Generated', 'Your training plan is ready.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', `Could not save your profile and generate a plan.\n\n${detail}`);
    }
  };

  if (profileLoading || !hydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isFirstRun ? 'Welcome to LiftIQ AI' : 'Recalibrate'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {isFirstRun
            ? "Answer a few questions and we'll build your training plan."
            : "Update your info below — we'll regenerate your plan from scratch."}
        </Text>
      </View>

      <SectionLabel colors={colors}>BIOMETRICS</SectionLabel>
      <View style={styles.row}>
        <View style={styles.half}>
          <FieldLabel colors={colors}>Age</FieldLabel>
          <TextInput
            value={form.age}
            onChangeText={(v) => patch({ age: v })}
            keyboardType="number-pad"
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
            ]}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View style={styles.half}>
          <FieldLabel colors={colors}>Weight (lbs)</FieldLabel>
          <TextInput
            value={form.weightLbs}
            onChangeText={(v) => patch({ weightLbs: v })}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
            ]}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <FieldLabel colors={colors}>Height (inches)</FieldLabel>
          <TextInput
            value={form.heightInches}
            onChangeText={(v) => patch({ heightInches: v })}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
            ]}
            placeholderTextColor={colors.mutedForeground}
          />
        </View>
        <View style={styles.half}>
          <FieldLabel colors={colors}>Gender</FieldLabel>
          <ChipRow options={GENDERS} value={form.gender} onChange={(v) => patch({ gender: v })} colors={colors} />
        </View>
      </View>

      <SectionLabel colors={colors}>GOALS & EXPERIENCE</SectionLabel>
      <FieldLabel colors={colors}>Primary Goal</FieldLabel>
      <ChipRow options={GOALS} value={form.fitnessGoal} onChange={(v) => patch({ fitnessGoal: v })} colors={colors} />
      <FieldLabel colors={colors}>Experience Level</FieldLabel>
      <ChipRow
        options={EXPERIENCE}
        value={form.experienceLevel}
        onChange={(v) => patch({ experienceLevel: v })}
        colors={colors}
      />

      <SectionLabel colors={colors}>SCHEDULE & SPLIT</SectionLabel>
      <FieldLabel colors={colors}>Training Days Per Week (1-7)</FieldLabel>
      <TextInput
        value={form.daysPerWeek}
        onChangeText={(v) => patch({ daysPerWeek: v })}
        keyboardType="number-pad"
        style={[
          styles.input,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
        ]}
        placeholderTextColor={colors.mutedForeground}
      />
      <FieldLabel colors={colors}>Other Activities (optional)</FieldLabel>
      <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
        Include volume/frequency if it's relevant — the AI reads this closely (e.g. "run 5 miles
        daily" changes the plan more than just "running").
      </Text>
      <TextInput
        value={form.currentActivities}
        onChangeText={(v) => patch({ currentActivities: v })}
        placeholder="e.g. run 5 miles daily, swim 1000 yards daily, jiu-jitsu 2x/week"
        multiline
        style={[
          styles.textarea,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
        ]}
        placeholderTextColor={colors.mutedForeground}
      />
      <FieldLabel colors={colors}>Schedule & Anything Else (optional)</FieldLabel>
      <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
        You don't need to specify exact tiers or day counts — just tell the AI your real
        situation (e.g. "I don't take rest days," "trying to lose belly fat," "bad knees") and
        it'll design the rotation and intensity structure to fit. Give it an exact split only if
        you already know what you want.
      </Text>
      <TextInput
        value={form.splitPreference}
        onChangeText={(v) => patch({ splitPreference: v })}
        placeholder="e.g. I don't take rest days and want to lose belly fat — or be specific: 9-day rotation, 3 heavy PPL / 3 moderate PPL / 3 light PPL"
        multiline
        style={[
          styles.textarea,
          { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card, minHeight: 90 },
        ]}
        placeholderTextColor={colors.mutedForeground}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={isPending}
        style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isPending ? 0.6 : 1 }]}
      >
        {isPending ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <>
            <Feather name="zap" size={18} color={colors.primaryForeground} />
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {isFirstRun ? 'Generate My Plan' : 'Recalibrate & Regenerate'}
            </Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 60, gap: 4 },
  header: { marginBottom: 12, gap: 6 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 12,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
    marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
  },
  submitText: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 0.5 },
});
