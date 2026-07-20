import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Small non-intrusive banner shown when cached data is being displayed
 * because the network is unavailable.
 */
export function OfflineBanner() {
  return (
    <View style={styles.banner}>
      <Feather name="wifi-off" size={12} color="#92400e" />
      <Text style={styles.text}>Offline — showing cached data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: '#92400e',
  },
});
