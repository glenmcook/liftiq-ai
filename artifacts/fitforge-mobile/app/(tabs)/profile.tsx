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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useGetProfile, useSaveProfile, getGetProfileQueryKey } from '@workspace/api-client-react';

const GOAL_OPTIONS = [
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'lose_fat', label: 'Lose Fat' },
  { value: 'athletic_performance', label: 'Athletic Performance' },
  { value: 'general_fitness', label: 'General Fitness' },
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

function SelectPill({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.pillRow}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? colors.primary : colors.muted,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: selected
                    ? colors.primaryForeground
                    : colors.foreground,
                },
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

function InputRow({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  unit,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  unit?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={[
            styles.input,
            {
              color: colors.foreground,
              borderColor: colors.border,
              backgroundColor: colors.card,
            },
          ]}
          placeholderTextColor={colors.mutedForeground}
        />
        {unit && (
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

const MORE_LINKS = [
  { href: '/library', label: 'Library', icon: 'book-open' as const },
  { href: '/dexa', label: 'DEXA Scans', icon: 'activity' as const },
  { href: '/diet', label: 'Diet', icon: 'coffee' as const },
  { href: '/checkin', label: 'AI Check-in', icon: 'zap' as const },
  { href: '/recommendations', label: 'Arsenal', icon: 'star' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
];

function MenuRow({
  icon,
  label,
  onPress,
  colors,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        menuStyles.row,
        { borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Feather name={icon} size={18} color={colors.foreground} />
      <Text style={[menuStyles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const router = useRouter();

  const { data: profile, isLoading } = useGetProfile({});
  const saveProfile = useSaveProfile();
  const queryClient = useQueryClient();

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('build_muscle');
  const [level, setLevel] = useState('intermediate');
  const [days, setDays] = useState('4');
  const [editing, setEditing] = useState(false);

  // Populate form when profile loads
  React.useEffect(() => {
    if (profile && !editing) {
      setAge(String(profile.age ?? ''));
      setWeight(String(profile.weightLbs ?? ''));
      setHeight(String(profile.heightInches ?? ''));
      setGender(profile.gender ?? '');
      setGoal(profile.fitnessGoal ?? 'build_muscle');
      setLevel(profile.experienceLevel ?? 'intermediate');
      setDays(String(profile.daysPerWeek ?? 4));
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync({
        data: {
          age: parseInt(age) || 25,
          gender: gender || 'other',
          weightLbs: parseFloat(weight) || undefined,
          heightInches: parseFloat(height) || undefined,
          fitnessGoal: goal,
          experienceLevel: level,
          daysPerWeek: parseInt(days) || 4,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

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

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 16,
          paddingBottom: isWeb ? 100 : 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Profile
        </Text>
        {!editing ? (
          <Pressable
            onPress={() => setEditing(true)}
            style={[styles.editBtn, { backgroundColor: colors.muted }]}
            hitSlop={8}
          >
            <Feather name="edit-2" size={15} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={styles.editActions}>
            <Pressable
              onPress={() => setEditing(false)}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saveProfile.isPending}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              {saveProfile.isPending ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[styles.saveText, { color: colors.primaryForeground }]}
                >
                  Save
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>

      {/* Avatar / initials */}
      <View style={styles.avatarSection}>
        <View
          style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}
        >
          <Feather name="user" size={32} color={colors.primary} />
        </View>
        {!editing && profile && (
          <View style={styles.profileMeta}>
            <Text style={[styles.profileLevel, { color: colors.foreground }]}>
              {LEVEL_OPTIONS.find((l) => l.value === profile.experienceLevel)?.label}
            </Text>
            <Text
              style={[styles.profileGoal, { color: colors.mutedForeground }]}
            >
              {GOAL_OPTIONS.find((g) => g.value === profile.fitnessGoal)?.label}
            </Text>
          </View>
        )}
      </View>

      {/* Stats overview (read-only) */}
      {!editing && profile && (
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>
              {profile.daysPerWeek}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
              days/week
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>
              {profile.weightLbs ?? '—'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
              lbs
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.foreground }]}>
              {profile.age}
            </Text>
            <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>
              years old
            </Text>
          </View>
        </View>
      )}

      {/* Edit form */}
      {editing && (
        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <InputRow
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            unit="yrs"
          />
          <InputRow
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            unit="lbs"
          />
          <InputRow
            label="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            unit="in"
          />
          <InputRow
            label="Days/Week"
            value={days}
            onChangeText={setDays}
            keyboardType="numeric"
          />

          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            FITNESS GOAL
          </Text>
          <SelectPill
            options={GOAL_OPTIONS}
            value={goal}
            onChange={setGoal}
          />

          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground }]}
          >
            EXPERIENCE LEVEL
          </Text>
          <SelectPill
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
          />
        </View>
      )}

      {/* More: Library, DEXA, Diet, AI Check-in, Arsenal, Settings */}
      {!editing && (
        <View style={{ marginTop: 4 }}>
          <Text
            style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 8 }]}
          >
            MORE
          </Text>
          <View
            style={[
              menuStyles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {MORE_LINKS.map((link, i) => (
              <MenuRow
                key={link.href}
                icon={link.icon}
                label={link.label}
                colors={colors}
                last={i === MORE_LINKS.length - 1}
                onPress={() => router.push(link.href as any)}
              />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const menuStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
});

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: {
    alignItems: 'center',
    gap: 2,
  },
  profileLevel: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  profileGoal: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  statsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  statLbl: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    marginVertical: 4,
  },
  formCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  inputRow: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  unit: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    width: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: -6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
});
