import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useColors } from '@/hooks/useColors';
import type { ThemeId } from '@/constants/colors';
import { useAuth } from './_layout';

function Row({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Feather
        name={icon}
        size={18}
        color={destructive ? colors.destructive : colors.foreground}
      />
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? colors.destructive : colors.foreground },
        ]}
      >
        {label}
      </Text>
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function ThemeSwatch({
  theme,
  active,
  onPress,
  colors,
}: {
  theme: { id: ThemeId; name: string; label: string; primaryHex: string; bgHex: string };
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.swatchCard,
        {
          borderColor: active ? theme.primaryHex : colors.border,
          borderWidth: active ? 2 : 1,
          backgroundColor: colors.card,
        },
      ]}
    >
      <View style={styles.swatchRow}>
        <View style={[styles.swatchDot, { backgroundColor: theme.bgHex, borderColor: colors.border }]} />
        <View style={[styles.swatchDot, { backgroundColor: theme.primaryHex }]} />
      </View>
      <Text style={[styles.swatchName, { color: colors.foreground }]} numberOfLines={1}>
        {theme.name}
      </Text>
      <Text style={[styles.swatchLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
        {theme.label}
      </Text>
      {active && (
        <View style={[styles.checkBadge, { backgroundColor: theme.primaryHex }]}>
          <Feather name="check" size={10} color={theme.id === 'arctic' ? '#ffffff' : '#050505'} />
        </View>
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 24 : insets.top;
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log Out', 'You will need your access code to log back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
        APPEARANCE
      </Text>
      <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
        Choose your color theme. Changes apply instantly.
      </Text>
      <View style={styles.swatchGrid}>
        {colors.themes.map((theme) => (
          <ThemeSwatch
            key={theme.id}
            theme={theme}
            active={colors.themeId === theme.id}
            onPress={() => colors.setTheme(theme.id)}
            colors={colors}
          />
        ))}
      </View>

      <Text
        style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}
      >
        ACCOUNT
      </Text>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Row icon="log-out" label="Log Out" onPress={confirmLogout} destructive />
      </View>

      <Text
        style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}
      >
        ABOUT
      </Text>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Version</Text>
          <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>
            {Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 14,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatchCard: {
    width: '31%',
    borderRadius: 14,
    padding: 10,
    gap: 4,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  swatchDot: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  swatchName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
  swatchLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500' as const,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
