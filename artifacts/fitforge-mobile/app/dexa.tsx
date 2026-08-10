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
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import {
  useListDexaScans,
  useCreateDexaScan,
  getListDexaScansQueryKey,
  customFetch,
} from '@workspace/api-client-react';

type FormState = {
  scanDate: string;
  bodyFatPercent: string;
  leanMassLbs: string;
  fatMassLbs: string;
  boneDensity: string;
  totalWeightLbs: string;
  visceralFatLevel: string;
  notes: string;
};

const emptyForm: FormState = {
  scanDate: new Date().toISOString().split('T')[0],
  bodyFatPercent: '',
  leanMassLbs: '',
  fatMassLbs: '',
  boneDensity: '',
  totalWeightLbs: '',
  visceralFatLevel: '',
  notes: '',
};

function Field({
  label,
  value,
  onChangeText,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="—"
        placeholderTextColor={colors.mutedForeground}
        style={[styles.fieldInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
      />
    </View>
  );
}

function ScanCard({ scan, colors }: { scan: any; colors: ReturnType<typeof useColors> }) {
  const [expanded, setExpanded] = useState(false);
  const extras = [
    scan.fatMassLbs != null && { label: 'Fat Mass', value: `${scan.fatMassLbs} lbs` },
    scan.totalWeightLbs != null && { label: 'Total Weight', value: `${scan.totalWeightLbs} lbs` },
    scan.boneDensity != null && { label: 'Bone Density', value: `${scan.boneDensity} g/cm²` },
    scan.visceralFatLevel != null && { label: 'Visceral Fat', value: scan.visceralFatLevel },
  ].filter(Boolean) as { label: string; value: string | number }[];

  return (
    <View style={[styles.scanCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={styles.scanCardTop}>
        <View>
          <Text style={[styles.scanDate, { color: colors.foreground }]}>
            {new Date(scan.scanDate).toLocaleDateString()}
          </Text>
        </View>
        {(extras.length > 0) && (
          <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8}>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>
      <View style={styles.scanStats}>
        {scan.bodyFatPercent != null && (
          <View style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Body Fat</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>{scan.bodyFatPercent}%</Text>
          </View>
        )}
        {scan.leanMassLbs != null && (
          <View style={[styles.statBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Lean Mass</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{scan.leanMassLbs} lbs</Text>
          </View>
        )}
      </View>
      {expanded && extras.length > 0 && (
        <View style={styles.extrasGrid}>
          {extras.map((e) => (
            <View key={e.label} style={[styles.extraBox, { borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{e.label}</Text>
              <Text style={[styles.extraValue, { color: colors.foreground }]}>{e.value}</Text>
            </View>
          ))}
          {scan.notes ? (
            <Text style={[styles.notes, { color: colors.mutedForeground }]}>{scan.notes}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function DexaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;

  const { data: scans = [], isLoading } = useListDexaScans();
  const createScan = useCreateDexaScan();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<'manual' | 'upload' | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [parsing, setParsing] = useState(false);

  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const openMode = (m: 'manual' | 'upload') => {
    setForm(emptyForm);
    setMode(m);
  };

  const closeForm = () => {
    setMode(null);
    setForm(emptyForm);
  };

  const pickAndParse = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to upload a DEXA report.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setParsing(true);
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
      setForm({
        scanDate: data.scanDate ?? emptyForm.scanDate,
        bodyFatPercent: data.bodyFatPercent != null ? String(data.bodyFatPercent) : '',
        leanMassLbs: data.leanMassLbs != null ? String(data.leanMassLbs) : '',
        fatMassLbs: data.fatMassLbs != null ? String(data.fatMassLbs) : '',
        boneDensity: data.boneDensity != null ? String(data.boneDensity) : '',
        totalWeightLbs: data.totalWeightLbs != null ? String(data.totalWeightLbs) : '',
        visceralFatLevel: data.visceralFatLevel != null ? String(data.visceralFatLevel) : '',
        notes: data.notes ?? '',
      });
    } catch (err: any) {
      Alert.alert('Could not read report', err.message ?? 'Try a clearer photo or enter manually.');
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    const payload: any = { scanDate: form.scanDate };
    if (form.bodyFatPercent) payload.bodyFatPercent = Number(form.bodyFatPercent);
    if (form.leanMassLbs) payload.leanMassLbs = Number(form.leanMassLbs);
    if (form.fatMassLbs) payload.fatMassLbs = Number(form.fatMassLbs);
    if (form.boneDensity) payload.boneDensity = Number(form.boneDensity);
    if (form.totalWeightLbs) payload.totalWeightLbs = Number(form.totalWeightLbs);
    if (form.visceralFatLevel) payload.visceralFatLevel = Number(form.visceralFatLevel);
    if (form.notes) payload.notes = form.notes;
    try {
      await createScan.mutateAsync({ data: payload });
      queryClient.invalidateQueries({ queryKey: getListDexaScansQueryKey() });
      closeForm();
    } catch {
      Alert.alert('Error', 'Could not save scan. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {mode === null && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => openMode('upload')}
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Feather name="upload" size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Upload Report</Text>
          </Pressable>
          <Pressable
            onPress={() => openMode('manual')}
            style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Feather name="plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Enter Manually</Text>
          </Pressable>
        </View>
      )}

      {mode === 'upload' && (
        <View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Upload DEXA Report</Text>
            <Pressable onPress={closeForm} hitSlop={8}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
            Pick a photo of your DEXA report — the AI will read it and fill in the numbers below.
          </Text>
          <Pressable
            onPress={pickAndParse}
            disabled={parsing}
            style={[styles.uploadZone, { borderColor: colors.border }]}
          >
            {parsing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Feather name="image" size={28} color={colors.mutedForeground} />
                <Text style={[styles.helperText, { color: colors.mutedForeground, marginTop: 8 }]}>
                  Tap to choose a photo
                </Text>
              </>
            )}
          </Pressable>

          {(form.bodyFatPercent || form.leanMassLbs) && !parsing ? (
            <>
              <View style={styles.fieldsGrid}>
                <Field label="Body Fat %" value={form.bodyFatPercent} onChangeText={set('bodyFatPercent')} colors={colors} />
                <Field label="Lean Mass (lbs)" value={form.leanMassLbs} onChangeText={set('leanMassLbs')} colors={colors} />
                <Field label="Fat Mass (lbs)" value={form.fatMassLbs} onChangeText={set('fatMassLbs')} colors={colors} />
                <Field label="Total Weight (lbs)" value={form.totalWeightLbs} onChangeText={set('totalWeightLbs')} colors={colors} />
                <Field label="Bone Density" value={form.boneDensity} onChangeText={set('boneDensity')} colors={colors} />
                <Field label="Visceral Fat" value={form.visceralFatLevel} onChangeText={set('visceralFatLevel')} colors={colors} />
              </View>
              <Pressable
                onPress={handleSave}
                disabled={createScan.isPending}
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              >
                {createScan.isPending ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Scan</Text>
                )}
              </Pressable>
            </>
          ) : null}
        </View>
      )}

      {mode === 'manual' && (
        <View style={[styles.formCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.formHeader}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Enter Scan Data</Text>
            <Pressable onPress={closeForm} hitSlop={8}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={styles.fieldsGrid}>
            <Field label="Date (YYYY-MM-DD)" value={form.scanDate} onChangeText={set('scanDate')} colors={colors} />
            <Field label="Body Fat %" value={form.bodyFatPercent} onChangeText={set('bodyFatPercent')} colors={colors} />
            <Field label="Lean Mass (lbs)" value={form.leanMassLbs} onChangeText={set('leanMassLbs')} colors={colors} />
            <Field label="Fat Mass (lbs)" value={form.fatMassLbs} onChangeText={set('fatMassLbs')} colors={colors} />
            <Field label="Total Weight (lbs)" value={form.totalWeightLbs} onChangeText={set('totalWeightLbs')} colors={colors} />
            <Field label="Bone Density" value={form.boneDensity} onChangeText={set('boneDensity')} colors={colors} />
            <Field label="Visceral Fat" value={form.visceralFatLevel} onChangeText={set('visceralFatLevel')} colors={colors} />
          </View>
          <Pressable
            onPress={handleSave}
            disabled={createScan.isPending}
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          >
            {createScan.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>Save Scan</Text>
            )}
          </Pressable>
        </View>
      )}

      <View style={styles.scanList}>
        {scans.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No scans logged yet.</Text>
        ) : (
          scans.map((scan: any) => <ScanCard key={scan.id} scan={scan} colors={colors} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  formCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 14 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  formTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  helperText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  uploadZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fieldWrap: { width: '47%', gap: 5 },
  fieldLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  saveBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  scanList: { gap: 12 },
  empty: { textAlign: 'center', paddingVertical: 40, fontFamily: 'Inter_400Regular', fontSize: 14 },
  scanCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  scanCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanDate: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  scanStats: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  extrasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  extraBox: { flexBasis: '47%', borderWidth: 1, borderRadius: 10, padding: 8 },
  extraValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  notes: { fontSize: 12, fontFamily: 'Inter_400Regular', width: '100%', marginTop: 4 },
});
