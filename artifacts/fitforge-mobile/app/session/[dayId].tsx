import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  useCreateSession,
  useLogSet,
  useUpdateSession,
} from '@workspace/api-client-react';
import { CelebrationModal } from '@/components/CelebrationModal';
import { SwapExerciseModal } from '@/components/SwapExerciseModal';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useOfflineWorkoutDay } from '@/hooks/useOfflineWorkoutDay';
import { notifyPersonalRecord } from '@/hooks/usePushNotifications';

interface SwappedExercise {
  id: number;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
}

interface LogEntry {
  exerciseId: number;
  setNumber: number;
  reps: string;
  weight: string;
  done: boolean;
}

// Same normalization as library.tsx's getWatchUrl — embed URLs open fine in
// a webview but not always via the OS-level Linking.openURL, so route
// through the watch page instead.
function getWatchUrl(url: string): string {
  const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (embedMatch) return `https://www.youtube.com/watch?v=${embedMatch[1]}`;
  return url;
}

function RestTimerBar({
  seconds,
  onDismiss,
  colors,
}: {
  seconds: number;
  onDismiss: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [running, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [timeLeft]);

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const label = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  const pct = seconds > 0 ? Math.max(0, Math.min(1, timeLeft / seconds)) : 0;

  return (
    <View style={[styles.timerBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.timerProgressTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.timerProgressFill, { width: `${pct * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <View style={styles.timerRow}>
        <View>
          <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>REST</Text>
          <Text style={[styles.timerValue, { color: timeLeft === 0 ? colors.primary : colors.foreground }]}>
            {label}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setRunning((r) => !r)}
            style={[styles.timerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={running ? 'pause' : 'play'} size={16} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => {
              setTimeLeft(seconds);
              setRunning(true);
              notifiedRef.current = false;
            }}
            style={[styles.timerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="rotate-ccw" size={16} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={[styles.timerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="x" size={16} color={colors.foreground} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function SessionScreen() {
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // headerShown is false for this screen (see _layout.tsx) so this is the
  // only way in or out — without it there is no way back to the tabs.
  const backButton = (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      hitSlop={10}
      style={[
        styles.backBtn,
        { top: insets.top + 10, backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Feather name="chevron-left" size={22} color={colors.foreground} />
    </Pressable>
  );

  const { day, isLoading, isError, isOffline } = useOfflineWorkoutDay(
    parseInt(dayId ?? '0')
  );

  const createSession = useCreateSession();
  const logSet = useLogSet();
  const updateSession = useUpdateSession();

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [logEntries, setLogEntries] = useState<Record<string, LogEntry>>({});
  const [swaps, setSwaps] = useState<Record<number, SwappedExercise>>({});
  const [swapTarget, setSwapTarget] = useState<{ exerciseId: number; muscleGroup: string } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  // { seconds, nonce } rather than a bare number so back-to-back sets with
  // the identical rest duration still remount the timer (via key={nonce})
  // instead of silently no-op'ing because the prop value didn't change.
  const [restTimer, setRestTimer] = useState<{ seconds: number; nonce: number } | null>(null);

  const entryKey = (exerciseId: number, setNumber: number) =>
    `${exerciseId}-${setNumber}`;

  const getEntry = (
    exerciseId: number,
    setNumber: number,
    defaultReps: number,
    defaultWeight?: number | null
  ): LogEntry => {
    const key = entryKey(exerciseId, setNumber);
    return (
      logEntries[key] ?? {
        exerciseId,
        setNumber,
        reps: String(defaultReps),
        weight: String(defaultWeight ?? ''),
        done: false,
      }
    );
  };

  const updateEntry = (
    exerciseId: number,
    setNumber: number,
    patch: Partial<LogEntry>,
    defaultReps = 0,
    defaultWeight: number | null = null
  ) => {
    const key = entryKey(exerciseId, setNumber);
    setLogEntries((prev) => {
      const existing: LogEntry = prev[key] ?? {
        exerciseId,
        setNumber,
        reps: String(defaultReps),
        weight: defaultWeight != null ? String(defaultWeight) : '',
        done: false,
      };
      return { ...prev, [key]: { ...existing, ...patch } };
    });
  };

  const handleStart = async () => {
    if (!day) return;
    setStarting(true);
    try {
      const session = await createSession.mutateAsync({
        data: { dayId: day.id },
      });
      setSessionId(session.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('handleStart failed:', err);
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', `Could not start session. Please try again.\n\n${detail}`);
    } finally {
      setStarting(false);
    }
  };

  // slotExerciseId is always the original prescribed exercise ID — used as the
  // stable state key regardless of swaps.  The effective ID sent to the API
  // is resolved here from the swaps map so the call site stays simple.
  const handleLogSet = async (
    slotExerciseId: number,
    setNumber: number,
    reps: string,
    weight: string,
    restSeconds: number
  ) => {
    if (!sessionId) return;
    const parsedReps = parseInt(reps);
    if (!parsedReps || parsedReps <= 0) {
      Alert.alert('Enter reps', 'Please enter a valid number of reps before logging this set.');
      return;
    }
    try {
      const parsedWeight = parseFloat(weight);
      // Use the swapped exercise ID for the API call if one is active for this slot
      const effectiveExerciseId = swaps[slotExerciseId]?.id ?? slotExerciseId;
      const result = await logSet.mutateAsync({
        sessionId,
        data: {
          exerciseId: effectiveExerciseId,
          setNumber,
          actualReps: parsedReps,
          actualWeightLbs: Number.isFinite(parsedWeight) && parsedWeight > 0
            ? parsedWeight
            : undefined,
        },
      });
      // Always key done-state on the slot (original) exercise ID.
      // Pass through the exact reps/weight strings that were just logged —
      // updateEntry's fallback defaults (reps: 0) only apply when no entry
      // exists yet, which is the case whenever the set was logged from the
      // placeholder-shown recommended value without the user typing into
      // the field first. Without this, the displayed value would reset to
      // "0" instead of showing what was actually recorded.
      updateEntry(slotExerciseId, setNumber, { done: true, reps, weight });

      if (restSeconds > 0) {
        setRestTimer((prev) => ({ seconds: restSeconds, nonce: (prev?.nonce ?? 0) + 1 }));
      }

      // Dopamine hit — fire an immediate push notification for PRs
      if (result?.isPersonalRecord && Number.isFinite(parsedWeight) && parsedWeight > 0) {
        const exerciseName =
          swaps[slotExerciseId]?.name ??
          day?.exerciseGroups
            .flatMap((g) => g.exercises)
            .find((ex) => ex.exercise.id === slotExerciseId)?.exercise.name ??
          'Exercise';
        notifyPersonalRecord(exerciseName, parsedWeight);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (err) {
      console.error('handleLogSet failed:', err);
      const detail = err instanceof Error ? err.message : String(err);
      Alert.alert('Error', `Could not log set.\n\n${detail}`);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    Alert.alert('Finish Workout?', 'Mark this session as complete?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          setFinishing(true);
          try {
            await updateSession.mutateAsync({
              sessionId,
              data: { completedAt: new Date().toISOString() },
            });
            setShowCelebration(true);
          } catch {
            Alert.alert('Error', 'Could not finish session.');
            setFinishing(false);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {backButton}
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !day) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        {backButton}
        <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Could not load workout
        </Text>
      </View>
    );
  }

  const allDone = Object.values(logEntries).every((e) => e.done);
  const doneSets = Object.values(logEntries).filter((e) => e.done).length;
  const totalSets = day.exerciseGroups.reduce(
    (acc, g) =>
      acc +
      g.exercises.reduce((ea, ex) => ea + ex.prescribedSets.length, 0),
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {backButton}
      {isOffline && <OfflineBanner />}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 52,
            // The rest timer bar renders inside the fixed bottomBar (see
            // below) and grows its height — without accounting for that
            // here, the last set row(s) end up hidden underneath it.
            paddingBottom: (Platform.OS === 'web' ? 100 : 120) + (restTimer ? 110 : 0),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Day header */}
        <View
          style={[
            styles.dayHeader,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View>
            <Text style={[styles.dayLabel, { color: colors.foreground }]}>
              {day.label}
            </Text>
            <Text style={[styles.dayMeta, { color: colors.mutedForeground }]}>
              Day {day.dayNumber} · Rest {Math.round(day.restSeconds / 60)}m between sets
            </Text>
          </View>
          {sessionId && (
            <View style={styles.progressInfo}>
              <Text style={[styles.progressNum, { color: colors.primary }]}>
                {doneSets}/{totalSets}
              </Text>
              <Text
                style={[styles.progressLbl, { color: colors.mutedForeground }]}
              >
                sets
              </Text>
            </View>
          )}
        </View>

        {/* Exercise groups */}
        {day.exerciseGroups.map((group) => (
          <View key={group.groupName} style={styles.groupSection}>
            <View style={styles.groupHeader}>
              <Text
                style={[styles.groupName, { color: colors.mutedForeground }]}
              >
                {group.groupName.toUpperCase()}
              </Text>
              {group.pickOne && (
                <View
                  style={[
                    styles.pickOneBadge,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text
                    style={[styles.pickOneText, { color: colors.primary }]}
                  >
                    Pick one
                  </Text>
                </View>
              )}
            </View>

            {group.exercises.map((ex) => {
              const swapped = swaps[ex.exerciseId];
              const effective = swapped ?? ex.exercise;
              // SwappedExercise doesn't carry a video URL, so only show the
              // original exercise's tutorial when it hasn't been swapped —
              // showing the old video for a swapped-in exercise would be wrong.
              const videoUrl = swapped ? undefined : ex.exercise.videoUrl;
              return (
              <View
                key={ex.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: swapped ? '#f59e0b' : colors.cardBorder,
                    borderWidth: swapped ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseTitleRow}>
                    <View style={{ flex: 1 }}>
                      {swapped && (
                        <Text style={[styles.originalName, { color: colors.mutedForeground }]}>
                          ↩ {ex.exercise.name}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.exerciseName,
                          { color: swapped ? '#f59e0b' : colors.foreground },
                        ]}
                      >
                        {effective.name}
                        {swapped ? '  ↔' : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      {videoUrl && (
                        <Pressable
                          onPress={() => Linking.openURL(getWatchUrl(videoUrl))}
                          hitSlop={8}
                          style={[styles.playBtn, { backgroundColor: colors.primary }]}
                        >
                          <Feather name="play" size={14} color={colors.primaryForeground} />
                        </Pressable>
                      )}
                      <View
                        style={[
                          styles.muscleBadge,
                          { backgroundColor: colors.muted },
                        ]}
                      >
                        <Text
                          style={[
                            styles.muscleText,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {effective.muscleGroup}
                        </Text>
                      </View>
                      {sessionId && (
                        <Pressable
                          onPress={() => setSwapTarget({ exerciseId: ex.exerciseId, muscleGroup: ex.exercise.muscleGroup })}
                          style={[styles.busyBtn, { backgroundColor: swapped ? '#f59e0b20' : colors.muted, borderColor: swapped ? '#f59e0b' : colors.border }]}
                        >
                          <Text style={[styles.busyBtnText, { color: swapped ? '#f59e0b' : colors.mutedForeground }]}>
                            {swapped ? 'Re-swap' : 'Busy?'}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                  {effective.equipment && (
                    <Text
                      style={[
                        styles.equipment,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      <Feather name="package" size={11} />{' '}
                      {effective.equipment}
                    </Text>
                  )}
                </View>

                {/* Set rows */}
                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text
                      style={[
                        styles.setColHeader,
                        { color: colors.mutedForeground, width: 32 },
                      ]}
                    >
                      Set
                    </Text>
                    <Text
                      style={[
                        styles.setColHeader,
                        { color: colors.mutedForeground, flex: 1 },
                      ]}
                    >
                      Target
                    </Text>
                    <Text
                      style={[
                        styles.setColHeader,
                        { color: colors.mutedForeground, width: 64 },
                      ]}
                    >
                      Reps
                    </Text>
                    <Text
                      style={[
                        styles.setColHeader,
                        { color: colors.mutedForeground, width: 64 },
                      ]}
                    >
                      lbs
                    </Text>
                    <View style={{ width: 36 }} />
                  </View>

                  {ex.prescribedSets.map((ps) => {
                    const entry = getEntry(
                      ex.exerciseId,
                      ps.setNumber,
                      ps.targetRepsMin,
                      ps.targetWeightLbs
                    );
                    const isDone = entry.done;

                    return (
                      <View
                        key={ps.id}
                        style={[
                          styles.setRow,
                          isDone && {
                            backgroundColor: colors.primary + '10',
                            borderRadius: 8,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.setNum,
                            { color: colors.mutedForeground, width: 32 },
                          ]}
                        >
                          {ps.setNumber}
                        </Text>
                        <Text
                          style={[
                            styles.targetText,
                            { color: colors.mutedForeground, flex: 1 },
                          ]}
                        >
                          {ps.targetRepsMin}–{ps.targetRepsMax} reps
                          {ps.targetWeightLbs
                            ? ` @ ${ps.targetWeightLbs}lbs`
                            : ''}
                        </Text>
                        <TextInput
                          value={entry.reps}
                          onChangeText={(v) =>
                            updateEntry(
                              ex.exerciseId,
                              ps.setNumber,
                              { reps: v },
                              ps.targetRepsMin,
                              ps.targetWeightLbs ?? null
                            )
                          }
                          keyboardType="numeric"
                          editable={!!sessionId && !isDone}
                          style={[
                            styles.setInput,
                            {
                              color: colors.foreground,
                              borderColor: isDone
                                ? colors.primary
                                : colors.border,
                              backgroundColor: colors.background,
                              width: 56,
                            },
                          ]}
                          placeholder={String(ps.targetRepsMin)}
                          placeholderTextColor={colors.mutedForeground}
                        />
                        <TextInput
                          value={entry.weight}
                          onChangeText={(v) =>
                            updateEntry(
                              ex.exerciseId,
                              ps.setNumber,
                              { weight: v },
                              ps.targetRepsMin,
                              ps.targetWeightLbs ?? null
                            )
                          }
                          keyboardType="decimal-pad"
                          editable={!!sessionId && !isDone}
                          style={[
                            styles.setInput,
                            {
                              color: colors.foreground,
                              borderColor: isDone
                                ? colors.primary
                                : colors.border,
                              backgroundColor: colors.background,
                              width: 56,
                            },
                          ]}
                          placeholder={
                            ps.targetWeightLbs
                              ? String(ps.targetWeightLbs)
                              : '—'
                          }
                          placeholderTextColor={colors.mutedForeground}
                        />
                        <Pressable
                          onPress={() =>
                            handleLogSet(
                              ex.exerciseId,
                              ps.setNumber,
                              entry.reps,
                              entry.weight,
                              ps.restSeconds
                            )
                          }
                          disabled={!sessionId || isDone}
                          style={({ pressed }) => [
                            styles.doneBtn,
                            {
                              backgroundColor: isDone
                                ? colors.primary
                                : colors.muted,
                              opacity:
                                (!sessionId || isDone) && !isDone ? 0.5 : pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Feather
                            name="check"
                            size={16}
                            color={
                              isDone
                                ? colors.primaryForeground
                                : colors.mutedForeground
                            }
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Modals */}
      <CelebrationModal
        visible={showCelebration}
        onDone={() => {
          setShowCelebration(false);
          router.replace('/(tabs)/history');
        }}
      />
      <SwapExerciseModal
        visible={!!swapTarget}
        currentExerciseId={swapTarget?.exerciseId ?? 0}
        muscleGroup={swapTarget?.muscleGroup ?? ''}
        onSelect={(exercise) => {
          if (swapTarget) {
            setSwaps((prev) => ({ ...prev, [swapTarget.exerciseId]: exercise }));
          }
          setSwapTarget(null);
        }}
        onClose={() => setSwapTarget(null)}
      />

      {/* Fixed bottom button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom:
              Platform.OS === 'web' ? 34 : 24,
          },
        ]}
      >
        {sessionId && restTimer && (
          <RestTimerBar
            key={restTimer.nonce}
            seconds={restTimer.seconds}
            onDismiss={() => setRestTimer(null)}
            colors={colors}
          />
        )}
        {!sessionId ? (
          <Pressable
            onPress={handleStart}
            disabled={starting}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {starting ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather
                  name="play"
                  size={18}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Start Workout
                </Text>
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleFinish}
            disabled={finishing}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            {finishing ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Feather
                  name="flag"
                  size={18}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Finish Workout
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  timerBar: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  timerProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  timerProgressFill: {
    height: '100%',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timerLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  timerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 0,
  },
  dayHeader: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  dayMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressNum: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  progressLbl: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupSection: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1,
  },
  pickOneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pickOneText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
  exerciseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  exerciseHeader: {
    marginBottom: 10,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  exerciseName: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  originalName: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  busyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  busyBtnText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  playBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  muscleText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    textTransform: 'capitalize',
  },
  equipment: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 3,
  },
  setsContainer: {
    gap: 6,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  setColHeader: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  setNum: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  targetText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  setInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
});
