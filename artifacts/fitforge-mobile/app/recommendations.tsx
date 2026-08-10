import React from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGetRecommendations } from '@workspace/api-client-react';

const UTM = '?utm_source=liftiq&utm_medium=referral&utm_campaign=dexa_providers';

const DEXA_PROVIDERS = [
  {
    name: 'DexaFit',
    tagline: 'Nationwide Network',
    description: 'The largest DEXA scanning network in the US — 100+ locations, VO2 Max and RMR add-ons.',
    url: 'https://www.dexafit.com',
  },
  {
    name: 'BodySpec',
    tagline: 'Affordable & Accessible',
    description: 'High-accuracy scans at a low price point. Mobile trucks — no clinic visit needed.',
    url: 'https://www.bodyspec.com',
  },
  {
    name: 'Kalos',
    tagline: 'Precision Body Comp',
    description: 'Clinic-grade scanning with in-depth analysis and one-on-one consultations.',
    url: 'https://www.getkalos.com',
  },
  {
    name: 'Fitnescity',
    tagline: 'Book Any Lab Near You',
    description: 'Marketplace aggregating DEXA slots at hospitals and performance labs nationwide.',
    url: 'https://www.fitnescity.com',
  },
  {
    name: 'Life Time',
    tagline: 'In-Gym Scanning',
    description: 'Many Life Time Athletic clubs offer on-site DEXA scans through Performance services.',
    url: 'https://www.lifetime.life/life-time-offerings/health-services/dexa-scan.html',
  },
];

export default function RecommendationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;

  const { data: recs, isLoading } = useGetRecommendations();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>DEXA Scanning</Text>
        </View>
        <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
          DEXA is the gold standard for body composition tracking. These are top providers trusted by
          serious athletes and coaches.
        </Text>
        {DEXA_PROVIDERS.map((p) => (
          <View key={p.name} style={[styles.providerCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.providerTagline, { color: colors.mutedForeground }]}>{p.tagline}</Text>
            <Text style={[styles.providerName, { color: colors.primary }]}>{p.name}</Text>
            <Text style={[styles.providerDesc, { color: colors.foreground }]}>{p.description}</Text>
            <Pressable
              onPress={() => Linking.openURL(`${p.url}${UTM}`)}
              style={[styles.findBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            >
              <Text style={[styles.findBtnText, { color: colors.primary }]}>Find a Location</Text>
              <Feather name="external-link" size={14} color={colors.primary} />
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="star" size={16} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Picks</Text>
        </View>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          recs?.map((rec: any) => (
            <View key={rec.id} style={[styles.recCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
              {rec.imageUrl ? (
                <Image source={{ uri: rec.imageUrl }} style={styles.recImage} resizeMode="cover" />
              ) : null}
              <View style={styles.recBody}>
                <Text style={[styles.recCategory, { color: colors.primary, backgroundColor: colors.primary + '15' }]}>
                  {rec.category}
                </Text>
                <Text style={[styles.recTitle, { color: colors.foreground }]}>{rec.title}</Text>
                {rec.brand ? (
                  <Text style={[styles.recBrand, { color: colors.mutedForeground }]}>{rec.brand}</Text>
                ) : null}
                <Text style={[styles.recDesc, { color: colors.foreground }]}>{rec.description}</Text>
                {rec.relevanceReason ? (
                  <Text style={[styles.recReason, { color: colors.primary }]}>“{rec.relevanceReason}”</Text>
                ) : null}
                {rec.affiliateUrl ? (
                  <Pressable
                    onPress={() => Linking.openURL(rec.affiliateUrl)}
                    style={[styles.acquireBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.acquireBtnText, { color: colors.primaryForeground }]}>Acquire</Text>
                    <Feather name="external-link" size={14} color={colors.primaryForeground} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 40, gap: 32 },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  helperText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginTop: -6 },
  providerCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  providerTagline: { fontSize: 10, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, textTransform: 'uppercase', letterSpacing: 0.5 },
  providerName: { fontSize: 19, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  providerDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19, marginTop: 4 },
  findBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginTop: 8 },
  findBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  recCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  recImage: { width: '100%', height: 160 },
  recBody: { padding: 16, gap: 8 },
  recCategory: { alignSelf: 'flex-start', fontSize: 10, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', textTransform: 'uppercase' },
  recTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  recBrand: { fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  recDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },
  recReason: { fontSize: 12, fontFamily: 'Inter_400Regular', fontStyle: 'italic', marginTop: 4 },
  acquireBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  acquireBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
