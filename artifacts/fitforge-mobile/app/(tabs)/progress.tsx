import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { useGetWeightProgress, useListExercises } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_H = 220;
const CHART_PAD = { top: 16, right: 16, bottom: 48, left: 52 };

// ── Tiny line chart built on react-native-svg ──────────────────────────────

type ChartPoint = { date: string; weightLbs: number };

function LineChart({
  data,
  color,
  mutedColor,
  bgColor,
  cardColor,
  foregroundColor,
}: {
  data: ChartPoint[];
  color: string;
  mutedColor: string;
  bgColor: string;
  cardColor: string;
  foregroundColor: string;
}) {
  const width = SCREEN_WIDTH - 40; // horizontal padding of the card
  const plotW = width - CHART_PAD.left - CHART_PAD.right;
  const plotH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;

  const weights = data.map((d) => d.weightLbs);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const range = rawMax - rawMin || 1;
  // Add 10% headroom above and below so dots don't sit on the edge
  const yMin = rawMin - range * 0.1;
  const yMax = rawMax + range * 0.1;

  const toX = (i: number) =>
    data.length === 1
      ? CHART_PAD.left + plotW / 2
      : CHART_PAD.left + (i / (data.length - 1)) * plotW;

  const toY = (w: number) =>
    CHART_PAD.top + plotH - ((w - yMin) / (yMax - yMin)) * plotH;

  // Build SVG path
  const pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(d.weightLbs).toFixed(1)}`)
    .join(' ');

  // Y-axis ticks (≈4)
  const tickCount = 4;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = yMin + ((yMax - yMin) / tickCount) * i;
    return { val, y: toY(val) };
  });

  // X-axis labels — show first, middle, last
  const xLabels: { label: string; x: number }[] = [];
  if (data.length > 0) {
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    xLabels.push({ label: fmt(data[0].date), x: toX(0) });
    if (data.length > 2) {
      const mid = Math.floor((data.length - 1) / 2);
      xLabels.push({ label: fmt(data[mid].date), x: toX(mid) });
    }
    if (data.length > 1) {
      xLabels.push({ label: fmt(data[data.length - 1].date), x: toX(data.length - 1) });
    }
  }

  const [tooltip, setTooltip] = useState<{ i: number } | null>(null);
  const active = tooltip !== null ? data[tooltip.i] : null;

  return (
    <Svg width={width} height={CHART_H} onPress={() => setTooltip(null)}>
      {/* Horizontal grid lines */}
      {yTicks.map((t, i) => (
        <G key={i}>
          <Line
            x1={CHART_PAD.left}
            y1={t.y}
            x2={CHART_PAD.left + plotW}
            y2={t.y}
            stroke={mutedColor}
            strokeWidth={1}
            opacity={0.25}
          />
          <SvgText
            x={CHART_PAD.left - 6}
            y={t.y + 4}
            textAnchor="end"
            fontSize={10}
            fill={mutedColor}
          >
            {Math.round(t.val)}
          </SvgText>
        </G>
      ))}

      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <SvgText
          key={i}
          x={l.x}
          y={CHART_H - 6}
          textAnchor="middle"
          fontSize={10}
          fill={mutedColor}
        >
          {l.label}
        </SvgText>
      ))}

      {/* Line */}
      <Path d={pathD} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />

      {/* Hit-area dots (invisible, generous tap target) */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={toX(i)}
          cy={toY(d.weightLbs)}
          r={18}
          fill="transparent"
          onPress={() => setTooltip(tooltip?.i === i ? null : { i })}
        />
      ))}

      {/* Visible dots */}
      {data.map((d, i) => (
        <Circle
          key={i}
          cx={toX(i)}
          cy={toY(d.weightLbs)}
          r={tooltip?.i === i ? 6 : 4}
          fill={tooltip?.i === i ? bgColor : color}
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {/* Tooltip */}
      {active !== null && tooltip !== null && (() => {
        const cx = toX(tooltip.i);
        const cy = toY(active.weightLbs);
        const tipW = 90;
        const tipH = 38;
        const tipX = Math.min(
          Math.max(cx - tipW / 2, CHART_PAD.left),
          CHART_PAD.left + plotW - tipW,
        );
        const tipY = cy > CHART_PAD.top + tipH + 10 ? cy - tipH - 10 : cy + 14;
        const dateLabel = new Date(active.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        });
        return (
          <G>
            {/* Vertical cursor line */}
            <Line
              x1={cx}
              y1={CHART_PAD.top}
              x2={cx}
              y2={CHART_PAD.top + plotH}
              stroke={color}
              strokeWidth={1}
              opacity={0.4}
              strokeDasharray="4,3"
            />
            {/* Bubble */}
            <G>
              <SvgText
                x={tipX + tipW / 2}
                y={tipY + 14}
                textAnchor="middle"
                fontSize={11}
                fontWeight="700"
                fill={foregroundColor}
              >
                {active.weightLbs} lbs
              </SvgText>
              <SvgText
                x={tipX + tipW / 2}
                y={tipY + 28}
                textAnchor="middle"
                fontSize={10}
                fill={mutedColor}
              >
                {dateLabel}
              </SvgText>
            </G>
          </G>
        );
      })()}
    </Svg>
  );
}

// ── Exercise picker modal ──────────────────────────────────────────────────

type Exercise = { id: number; name: string };

function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
  colors,
}: {
  exercises: Exercise[];
  selectedId: number | undefined;
  onSelect: (id: number | undefined) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [open, setOpen] = useState(false);
  const selected = exercises.find((e) => e.id === selectedId);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.pickerBtn,
          {
            backgroundColor: colors.secondary,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[styles.pickerBtnText, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {selected ? selected.name : 'All Exercises'}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Select Exercise
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* "All" option */}
              <Pressable
                onPress={() => {
                  onSelect(undefined);
                  setOpen(false);
                }}
                style={[
                  styles.optionRow,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor:
                      selectedId === undefined ? colors.accent : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        selectedId === undefined
                          ? colors.primary
                          : colors.foreground,
                      fontFamily:
                        selectedId === undefined
                          ? 'Inter_600SemiBold'
                          : 'Inter_400Regular',
                    },
                  ]}
                >
                  All Exercises
                </Text>
                {selectedId === undefined && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </Pressable>

              {exercises.map((ex) => (
                <Pressable
                  key={ex.id}
                  onPress={() => {
                    onSelect(ex.id);
                    setOpen(false);
                  }}
                  style={[
                    styles.optionRow,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor:
                        selectedId === ex.id ? colors.accent : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedId === ex.id
                            ? colors.primary
                            : colors.foreground,
                        fontFamily:
                          selectedId === ex.id
                            ? 'Inter_600SemiBold'
                            : 'Inter_400Regular',
                      },
                    ]}
                  >
                    {ex.name}
                  </Text>
                  {selectedId === ex.id && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ── Exercise chart card ────────────────────────────────────────────────────

function ExerciseChartCard({
  exerciseName,
  points,
  colors,
}: {
  exerciseName: string;
  points: ChartPoint[];
  colors: ReturnType<typeof useColors>;
}) {
  const latestWeight = points[points.length - 1]?.weightLbs;
  const firstWeight = points[0]?.weightLbs;
  const delta =
    points.length >= 2 ? latestWeight - firstWeight : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text
          style={[styles.cardTitle, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {exerciseName}
        </Text>
        {delta !== null && (
          <View
            style={[
              styles.deltaBadge,
              {
                backgroundColor:
                  delta >= 0 ? colors.primary + '20' : colors.destructive + '20',
              },
            ]}
          >
            <Feather
              name={delta >= 0 ? 'trending-up' : 'trending-down'}
              size={12}
              color={delta >= 0 ? colors.primary : colors.destructive}
            />
            <Text
              style={[
                styles.deltaText,
                {
                  color: delta >= 0 ? colors.primary : colors.destructive,
                },
              ]}
            >
              {delta >= 0 ? '+' : ''}
              {delta.toFixed(1)} lbs
            </Text>
          </View>
        )}
      </View>

      {points.length === 1 && (
        <Text style={[styles.singlePoint, { color: colors.mutedForeground }]}>
          {latestWeight} lbs — log more sessions to see a trend
        </Text>
      )}

      {points.length >= 2 && (
        <LineChart
          data={points}
          color={colors.primary}
          mutedColor={colors.mutedForeground}
          bgColor={colors.card}
          cardColor={colors.card}
          foregroundColor={colors.foreground}
        />
      )}

      <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
        {points.length} session{points.length !== 1 ? 's' : ''} · latest{' '}
        {latestWeight} lbs
      </Text>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const [selectedExercise, setSelectedExercise] = useState<number | undefined>(undefined);

  const { data: exercises = [] } = useListExercises();

  const {
    data: rawPoints,
    isLoading,
    isError,
    refetch,
  } = useGetWeightProgress({ exerciseId: selectedExercise });

  // Group points by exercise
  const grouped = useMemo(() => {
    if (!rawPoints || rawPoints.length === 0) return [];

    const map = new Map<number, { name: string; points: ChartPoint[] }>();
    for (const p of rawPoints) {
      if (!map.has(p.exerciseId)) {
        map.set(p.exerciseId, { name: p.exerciseName, points: [] });
      }
      map.get(p.exerciseId)!.points.push({ date: p.date, weightLbs: p.weightLbs });
    }
    // Sort each exercise's points by date ascending
    for (const entry of map.values()) {
      entry.points.sort((a, b) => a.date.localeCompare(b.date));
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [rawPoints]);

  const exerciseOptions: Exercise[] = useMemo(
    () => exercises.map((e) => ({ id: e.id, name: e.name })),
    [exercises],
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: isWeb ? 100 : 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>
          Progress
        </Text>
      </View>

      {/* Exercise filter */}
      {exerciseOptions.length > 0 && (
        <ExercisePicker
          exercises={exerciseOptions}
          selectedId={selectedExercise}
          onSelect={setSelectedExercise}
          colors={colors}
        />
      )}

      {/* States */}
      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Could not load progress data
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
      )}

      {!isLoading && !isError && grouped.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="trending-up" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No data yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Complete workouts and log sets to see your strength gains plotted
            here.
          </Text>
        </View>
      )}

      {!isLoading && !isError && grouped.map((group) => (
        <ExerciseChartCard
          key={group.name}
          exerciseName={group.name}
          points={group.points}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
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
    maxWidth: 280,
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
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  pickerBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
  },
  // Card
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deltaText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  singlePoint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 8,
  },
});
