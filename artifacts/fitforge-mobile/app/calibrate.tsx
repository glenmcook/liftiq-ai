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
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import {
  useGetProfile,
  useSaveProfile,
  useGeneratePlan,
  useCreateDexaScan,
  customFetch,
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

const DIET_TYPES = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
];

interface FormState {
  age: string;
  gender: string;
  heightInches: string;
  weightLbs: string;
  dexaBodyFatPercent: string;
  dexaLeanMassLbs: string;
  dexaVisceralFatLevel: string;
  dexaFatMassLbs: string;
  dexaBoneDensity: string;
  dexaTotalWeightLbs: string;
  dexaNotes: string;
  currentActivities: string;
  experienceLevel: string;
  fitnessGoal: string;
  daysPerWeek: string;
  splitPreference: string;
  dietaryPreference: string;
  allergies: string;
}

const DEFAULT_FORM: FormState = {
  age: '',
  gender: 'male',
  heightInches: '',
  weightLbs: '',
  dexaBodyFatPercent: '',
  dexaLeanMassLbs: '',
  dexaVisceralFatLevel: '',
  dexaFatMassLbs: '',
  dexaBoneDensity: '',
  dexaTotalWeightLbs: '',
  dexaNotes: '',
  currentActivities: '',
  experienceLevel: 'intermediate',
  fitnessGoal: 'build_muscle',
  daysPerWeek: '4',
  splitPreference: '',
  dietaryPreference: 'omnivore',
  allergies: '',
};

type Colors = ReturnType<typeof useColors>;
type DietPrefsResponse = { dietaryPreference: string; allergies: string | null };

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
            <Text style={[styles.chipText, { color: active ? colors.primaryForeground : colors.foreground }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface Step {
  key: keyof FormState | 'review' | 'dexa';
  question: string;
  helper?: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  { key: 'age', question: 'How old are you?' },
  { key: 'gender', question: 'What is your gender?' },
  { key: 'heightInches', question: 'How tall are you?', helper: 'In inches — used to size your nutrition targets.', optional: true },
  { key: 'weightLbs', question: 'What do you weigh?', helper: 'In pounds — used for both training and nutrition targets.', optional: true },
  { key: 'dexa', question: 'Have a recent DEXA scan?', helper: 'Body composition data sharpens both your training intensity and nutrition targets. Leave blank if you don’t have one.', optional: true },
  { key: 'currentActivities', question: 'What do you currently do?', helper: 'Any cardio, sports, or other activity — and how often. This shapes both the exercises chosen and how the AI balances recovery.', optional: true },
  { key: 'experienceLevel', question: 'How experienced are you with training?' },
  { key: 'fitnessGoal', question: 'What is your main goal?' },
  { key: 'daysPerWeek', question: 'How many days a week do you want to train?' },
  { key: 'splitPreference', question: 'Anything else about your schedule or situation?', helper: 'Rest-day habits, injuries, time constraints, or an exact split if you already know what you want — just describe it in plain language.', optional: true },
  { key: 'dietaryPreference', question: 'What is your diet type?' },
  { key: 'allergies', question: 'Any allergies or foods to avoid?', helper: 'Optional — e.g. "dairy, shellfish"', optional: true },
  { key: 'review', question: 'Ready to build your plan' },
];

export default function CalibrateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // ProfileGate (root layout) already ran this exact query — with matching
  // cache options here, this reuses that result instead of firing a third
  // sequential network round-trip (after the startup token check and
  // ProfileGate's own fetch) before this screen can render anything.
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile(
    {},
    {
      query: {
        retry: false,
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    }
  );
  const saveProfile = useSaveProfile();
  const generatePlan = useGeneratePlan();
  const createDexaScan = useCreateDexaScan();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [hydrated, setHydrated] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [parsingDexa, setParsingDexa] = useState(false);
  // Safety net: if the initial profile check or diet-preferences fetch ever
  // hangs (bad connection, stale bundle, unforeseen bug), don't leave the
  // user staring at a spinner forever with no way out.
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (hydrated) {
      setStalled(false);
      return;
    }
    const timer = setTimeout(() => setStalled(true), 7000);
    return () => clearTimeout(timer);
  }, [hydrated, profileLoading]);

  const isFirstRun = !profileLoading && !profile;

  // Pre-fill from the existing profile + diet preferences (recalibrate
  // case). On first run there's nothing to fetch and we just keep defaults.
  useEffect(() => {
    if (hydrated || profileLoading) return;
    (async () => {
      if (profile) {
        let dietPrefs: DietPrefsResponse | null = null;
        try {
          dietPrefs = await customFetch<DietPrefsResponse>('/api/diet/preferences');
        } catch {
          // No diet preferences yet — fine, defaults apply.
        }
        setForm((f) => ({
          ...f,
          age: String(profile.age),
          gender: profile.gender,
          heightInches: profile.heightInches != null ? String(profile.heightInches) : '',
          weightLbs: profile.weightLbs != null ? String(profile.weightLbs) : '',
          currentActivities: profile.currentActivities ?? '',
          experienceLevel: profile.experienceLevel,
          fitnessGoal: profile.fitnessGoal,
          daysPerWeek: String(profile.daysPerWeek),
          splitPreference: profile.splitPreference ?? '',
          dietaryPreference: dietPrefs?.dietaryPreference ?? 'omnivore',
          allergies: dietPrefs?.allergies ?? '',
        }));
      }
      setHydrated(true);
    })();
  }, [profileLoading, profile, hydrated]);

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const pickAndParseDexa = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to import a DEXA report.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setParsingDexa(true);
    try {
      const fd = new FormData();
      fd.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'scan.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as any);
      const data = await customFetch<any>('/api/dexa-scans/parse', {
        method: 'POST',
        body: fd,
      });
      patch({
        dexaBodyFatPercent: data.bodyFatPercent != null ? String(data.bodyFatPercent) : form.dexaBodyFatPercent,
        dexaLeanMassLbs: data.leanMassLbs != null ? String(data.leanMassLbs) : form.dexaLeanMassLbs,
        dexaVisceralFatLevel: data.visceralFatLevel != null ? String(data.visceralFatLevel) : form.dexaVisceralFatLevel,
        dexaFatMassLbs: data.fatMassLbs != null ? String(data.fatMassLbs) : form.dexaFatMassLbs,
        dexaBoneDensity: data.boneDensity != null ? String(data.boneDensity) : form.dexaBoneDensity,
        dexaTotalWeightLbs: data.totalWeightLbs != null ? String(data.totalWeightLbs) : form.dexaTotalWeightLbs,
        dexaNotes: data.notes ?? form.dexaNotes,
      });
    } catch (err: any) {
      Alert.alert('Could not read report', err.message ?? 'Try a clearer photo or enter the numbers manually.');
    } finally {
      setParsingDexa(false);
    }
  };

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const canAdvance = (): boolean => {
    if (step.key === 'age') return !!form.age && parseInt(form.age, 10) > 0;
    if (step.key === 'daysPerWeek') {
      const n = parseInt(form.daysPerWeek, 10);
      return !!n && n >= 1 && n <= 7;
    }
    return true;
  };

  // Whether the current step has anything entered — used only to decide the
  // "Skip" vs "Next" button label on optional steps, never to block advancing.
  const stepHasValue = (): boolean => {
    if (step.key === 'dexa') {
      return !!(
        form.dexaBodyFatPercent ||
        form.dexaLeanMassLbs ||
        form.dexaVisceralFatLevel ||
        form.dexaFatMassLbs ||
        form.dexaBoneDensity ||
        form.dexaTotalWeightLbs
      );
    }
    if (step.key === 'review') return true;
    return !!form[step.key as keyof FormState];
  };

  const handleNext = () => {
    if (!canAdvance()) {
      Alert.alert('Missing info', 'Please answer this one before moving on.');
      return;
    }
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      if (!isFirstRun) router.back();
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSubmit = async () => {
    const age = parseInt(form.age, 10);
    const heightInches = parseFloat(form.heightInches);
    const weightLbs = parseFloat(form.weightLbs);
    const daysPerWeek = parseInt(form.daysPerWeek, 10);

    setSubmitting(true);
    try {
      await saveProfile.mutateAsync({
        data: {
          age,
          gender: form.gender,
          heightInches: Number.isFinite(heightInches) && heightInches > 0 ? heightInches : undefined,
          weightLbs: Number.isFinite(weightLbs) && weightLbs > 0 ? weightLbs : undefined,
          currentActivities: form.currentActivities || undefined,
          experienceLevel: form.experienceLevel,
          fitnessGoal: form.fitnessGoal,
          daysPerWeek,
          splitPreference: form.splitPreference || undefined,
        },
      });
      await customFetch('/api/diet/preferences', {
        method: 'POST',
        body: JSON.stringify({
          dietaryPreference: form.dietaryPreference,
          allergies: form.allergies || null,
        }),
      });

      const bodyFatPercent = parseFloat(form.dexaBodyFatPercent);
      const leanMassLbs = parseFloat(form.dexaLeanMassLbs);
      const visceralFatLevel = parseFloat(form.dexaVisceralFatLevel);
      const fatMassLbs = parseFloat(form.dexaFatMassLbs);
      const boneDensity = parseFloat(form.dexaBoneDensity);
      const totalWeightLbs = parseFloat(form.dexaTotalWeightLbs);
      const hasDexaData =
        Number.isFinite(bodyFatPercent) ||
        Number.isFinite(leanMassLbs) ||
        Number.isFinite(visceralFatLevel) ||
        Number.isFinite(fatMassLbs) ||
        Number.isFinite(boneDensity) ||
        Number.isFinite(totalWeightLbs);
      if (hasDexaData) {
        await createDexaScan.mutateAsync({
          data: {
            scanDate: new Date().toISOString().split('T')[0],
            bodyFatPercent: Number.isFinite(bodyFatPercent) ? bodyFatPercent : undefined,
            leanMassLbs: Number.isFinite(leanMassLbs) ? leanMassLbs : undefined,
            visceralFatLevel: Number.isFinite(visceralFatLevel) ? visceralFatLevel : undefined,
            fatMassLbs: Number.isFinite(fatMassLbs) ? fatMassLbs : undefined,
            boneDensity: Number.isFinite(boneDensity) ? boneDensity : undefined,
            totalWeightLbs: Number.isFinite(totalWeightLbs) ? totalWeightLbs : undefined,
            notes: form.dexaNotes || undefined,
          },
        });
      }

      await generatePlan.mutateAsync(undefined as unknown as void);
      queryClient.clear();
      Alert.alert('Plan Generated', 'Your training plan is ready.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', `Could not save your info and generate a plan.\n\n${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading || !hydrated) {
    if (stalled) {
      return (
        <View style={[styles.centered, { backgroundColor: colors.background, paddingHorizontal: 32, gap: 16 }]}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={[styles.question, { color: colors.foreground, fontSize: 17, textAlign: 'center' }]}>
            This is taking longer than expected
          </Text>
          <Text style={[styles.helper, { color: colors.mutedForeground, textAlign: 'center' }]}>
            Could be a slow connection. You can retry, or start fresh with default answers and edit them as you go.
          </Text>
          <Pressable
            onPress={() => {
              setStalled(false);
              refetchProfile();
            }}
            style={[styles.submitBtn, { backgroundColor: colors.primary, width: '100%' }]}
          >
            <Feather name="refresh-cw" size={16} color={colors.primaryForeground} />
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Retry</Text>
          </Pressable>
          <Pressable onPress={() => setHydrated(true)} style={{ padding: 10 }}>
            <Text style={[styles.helper, { color: colors.primary }]}>Skip — start fresh</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const inputStyle = [
    styles.input,
    { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
  ];
  const textareaStyle = [
    styles.textarea,
    { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
  ];

  const renderStepBody = () => {
    switch (step.key) {
      case 'age':
        return (
          <TextInput
            value={form.age}
            onChangeText={(v) => patch({ age: v })}
            keyboardType="number-pad"
            autoFocus
            placeholder="30"
            placeholderTextColor={colors.mutedForeground}
            style={[inputStyle, styles.bigInput]}
          />
        );
      case 'gender':
        return <ChipRow options={GENDERS} value={form.gender} onChange={(v) => patch({ gender: v })} colors={colors} />;
      case 'heightInches':
        return (
          <TextInput
            value={form.heightInches}
            onChangeText={(v) => patch({ heightInches: v })}
            keyboardType="decimal-pad"
            autoFocus
            placeholder="70"
            placeholderTextColor={colors.mutedForeground}
            style={[inputStyle, styles.bigInput]}
          />
        );
      case 'weightLbs':
        return (
          <TextInput
            value={form.weightLbs}
            onChangeText={(v) => patch({ weightLbs: v })}
            keyboardType="decimal-pad"
            autoFocus
            placeholder="180"
            placeholderTextColor={colors.mutedForeground}
            style={[inputStyle, styles.bigInput]}
          />
        );
      case 'dexa':
        return (
          <View style={{ gap: 14 }}>
            <Pressable
              onPress={pickAndParseDexa}
              disabled={parsingDexa}
              style={[styles.uploadZone, { borderColor: colors.border, opacity: parsingDexa ? 0.6 : 1 }]}
            >
              {parsingDexa ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Feather name="upload" size={20} color={colors.primary} />
                  <Text style={[styles.uploadZoneText, { color: colors.foreground }]}>
                    Import DEXA report photo
                  </Text>
                  <Text style={[styles.uploadZoneSubtext, { color: colors.mutedForeground }]}>
                    AI reads the numbers in for you — or enter them below
                  </Text>
                </>
              )}
            </Pressable>
            <View>
              <FieldLabel colors={colors}>Body Fat %</FieldLabel>
              <TextInput
                value={form.dexaBodyFatPercent}
                onChangeText={(v) => patch({ dexaBodyFatPercent: v })}
                keyboardType="decimal-pad"
                placeholder="e.g. 18.5"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
            </View>
            <View>
              <FieldLabel colors={colors}>Lean Mass (lbs)</FieldLabel>
              <TextInput
                value={form.dexaLeanMassLbs}
                onChangeText={(v) => patch({ dexaLeanMassLbs: v })}
                keyboardType="decimal-pad"
                placeholder="e.g. 145"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
            </View>
            <View>
              <FieldLabel colors={colors}>Visceral Fat Level</FieldLabel>
              <TextInput
                value={form.dexaVisceralFatLevel}
                onChangeText={(v) => patch({ dexaVisceralFatLevel: v })}
                keyboardType="decimal-pad"
                placeholder="e.g. 8"
                placeholderTextColor={colors.mutedForeground}
                style={inputStyle}
              />
            </View>
          </View>
        );
      case 'currentActivities':
        return (
          <TextInput
            value={form.currentActivities}
            onChangeText={(v) => patch({ currentActivities: v })}
            placeholder="e.g. run 5 miles daily, swim 1000 yards daily, jiu-jitsu 2x/week"
            placeholderTextColor={colors.mutedForeground}
            multiline
            autoFocus
            style={textareaStyle}
          />
        );
      case 'experienceLevel':
        return (
          <ChipRow options={EXPERIENCE} value={form.experienceLevel} onChange={(v) => patch({ experienceLevel: v })} colors={colors} />
        );
      case 'fitnessGoal':
        return <ChipRow options={GOALS} value={form.fitnessGoal} onChange={(v) => patch({ fitnessGoal: v })} colors={colors} />;
      case 'daysPerWeek':
        return (
          <TextInput
            value={form.daysPerWeek}
            onChangeText={(v) => patch({ daysPerWeek: v })}
            keyboardType="number-pad"
            autoFocus
            placeholder="4"
            placeholderTextColor={colors.mutedForeground}
            style={[inputStyle, styles.bigInput]}
          />
        );
      case 'splitPreference':
        return (
          <TextInput
            value={form.splitPreference}
            onChangeText={(v) => patch({ splitPreference: v })}
            placeholder="e.g. I don't take rest days and want to lose belly fat"
            placeholderTextColor={colors.mutedForeground}
            multiline
            autoFocus
            style={textareaStyle}
          />
        );
      case 'dietaryPreference':
        return (
          <ChipRow options={DIET_TYPES} value={form.dietaryPreference} onChange={(v) => patch({ dietaryPreference: v })} colors={colors} />
        );
      case 'allergies':
        return (
          <TextInput
            value={form.allergies}
            onChangeText={(v) => patch({ allergies: v })}
            placeholder="e.g. dairy, shellfish"
            placeholderTextColor={colors.mutedForeground}
            multiline
            autoFocus
            style={textareaStyle}
          />
        );
      case 'review': {
        const rows: [string, string][] = [
          ['Age', form.age || '—'],
          ['Gender', GENDERS.find((g) => g.value === form.gender)?.label ?? form.gender],
          ['Height', form.heightInches ? `${form.heightInches} in` : '—'],
          ['Weight', form.weightLbs ? `${form.weightLbs} lbs` : '—'],
          ['DEXA body fat', form.dexaBodyFatPercent ? `${form.dexaBodyFatPercent}%` : '—'],
          ['DEXA lean mass', form.dexaLeanMassLbs ? `${form.dexaLeanMassLbs} lbs` : '—'],
          ['DEXA visceral fat', form.dexaVisceralFatLevel || '—'],
          ['Activities', form.currentActivities || '—'],
          ['Experience', EXPERIENCE.find((e) => e.value === form.experienceLevel)?.label ?? form.experienceLevel],
          ['Goal', GOALS.find((g) => g.value === form.fitnessGoal)?.label ?? form.fitnessGoal],
          ['Days/week', form.daysPerWeek],
          ['Schedule notes', form.splitPreference || '—'],
          ['Diet', DIET_TYPES.find((d) => d.value === form.dietaryPreference)?.label ?? form.dietaryPreference],
          ['Allergies', form.allergies || '—'],
        ];
        return (
          <View style={[styles.reviewCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {rows.map(([label, value]) => (
              <View key={label} style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]} numberOfLines={2}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        );
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={handleBack} hitSlop={10} style={styles.topBarBtn}>
          {(stepIndex > 0 || !isFirstRun) && (
            <Feather name="chevron-left" size={22} color={colors.foreground} />
          )}
        </Pressable>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${((stepIndex + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>
          {stepIndex + 1}/{STEPS.length}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.question, { color: colors.foreground }]}>{step.question}</Text>
        {step.helper && (
          <Text style={[styles.helper, { color: colors.mutedForeground }]}>{step.helper}</Text>
        )}
        <View style={{ marginTop: 20 }}>{renderStepBody()}</View>
      </ScrollView>

      <KeyboardStickyView
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {isLastStep ? (
          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather name="zap" size={18} color={colors.primaryForeground} />
                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Generate My Plan</Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable onPress={handleNext} style={[styles.submitBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {step.optional && !stepHasValue() ? 'Skip' : 'Next'}
            </Text>
            <Feather name="chevron-right" size={18} color={colors.primaryForeground} />
          </Pressable>
        )}
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  uploadZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadZoneText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  uploadZoneSubtext: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topBarBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  stepCount: { fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, minWidth: 32, textAlign: 'right' },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  question: { fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, lineHeight: 30 },
  helper: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18, marginTop: 8 },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  bigInput: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, textAlign: 'center' },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 22, borderWidth: 1 },
  chipText: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  reviewCard: { borderWidth: 1, borderRadius: 14, padding: 4 },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  reviewLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, width: 100 },
  reviewValue: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'right' },
  bottomBar: { paddingHorizontal: 24, paddingTop: 14, borderTopWidth: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitText: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 0.3 },
});



