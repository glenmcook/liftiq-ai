import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const CELEBRATIONS = [
  { emoji: '🔥💪🔥', headline: 'ABSOLUTELY ON FIRE', sub: "You didn't just show up — you showed OUT." },
  { emoji: '🏆', headline: 'CHAMPION BEHAVIOUR', sub: 'Most people skip. You finished. That gap is where greatness lives.' },
  { emoji: '🦁', headline: 'THE LION IS FED', sub: 'Today you were a straight-up animal. Respect.' },
  { emoji: '⚡️⚡️⚡️', headline: 'PURE ELECTRICITY', sub: 'The energy you brought today? Completely unmatched.' },
  { emoji: '🚀', headline: 'LAUNCHING DIFFERENT', sub: 'Every session like this is rocket fuel for your future self.' },
  { emoji: '💎', headline: 'DIAMOND WORK ETHIC', sub: 'Forged under pressure. That\'s what you are.' },
  { emoji: '🌊', headline: 'UNSTOPPABLE FORCE', sub: 'Like water — relentless, powerful, impossible to hold back.' },
  { emoji: '🦅', headline: 'ELEVATION ACHIEVED', sub: 'While they rest, you rise. The view from up here? Earned.' },
  { emoji: '⚔️', headline: 'WARRIOR PROTOCOL: DONE', sub: 'You fought the resistance and won. Every. Single. Rep.' },
  { emoji: '🎯', headline: 'LOCKED IN & DELIVERED', sub: 'Focused. Disciplined. Lethal. That\'s what today looked like.' },
  { emoji: '🌋', headline: 'VOLCANIC OUTPUT', sub: 'The force you put into that session? It moved mountains.' },
  { emoji: '👑', headline: 'ROYALTY IN THE GYM', sub: 'Not everyone gets a crown. Yours was earned in this session.' },
  { emoji: '🐉', headline: 'DRAGON ENERGY UNLEASHED', sub: 'Rare. Powerful. Impossible to ignore.' },
  { emoji: '💥', headline: 'DETONATED IT', sub: 'You walked in with a plan and blew the doors off. Incredible.' },
  { emoji: '🏔️', headline: 'SUMMIT MENTALITY', sub: 'The peak belongs to those who keep climbing. Today you climbed.' },
  { emoji: '🌟🌟🌟', headline: 'STELLAR PERFORMANCE', sub: 'Some sessions are just different. This was one of them.' },
  { emoji: '🎖️', headline: 'DECORATED TODAY', sub: 'Not every soldier gets a medal. Today you earned yours.' },
  { emoji: '🤯', headline: 'GENUINELY IMPRESSIVE', sub: 'If someone watched that session, their jaw would be on the floor.' },
  { emoji: '🧠💪', headline: 'MIND & MUSCLE ALIGNED', sub: "When your brain and body sync up like that — nothing can stop you." },
  { emoji: '🌅', headline: 'BUILT FOR THIS MOMENT', sub: "Today's effort is tomorrow's strength. You're building something real." },
];

function pickRandom() {
  return CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
}

interface CelebrationModalProps {
  visible: boolean;
  onDone: () => void;
}

export function CelebrationModal({ visible, onDone }: CelebrationModalProps) {
  const colors = useColors();
  const celebration = useRef(pickRandom());
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset for next show
      celebration.current = pickRandom();
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      // Fire haptics
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 550);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 750);
    }
  }, [visible]);

  const { emoji, headline, sub } = celebration.current;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim, backgroundColor: colors.background }]}>
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>

          {/* Emoji */}
          <View style={[styles.emojiRing, { backgroundColor: colors.primary + '15' }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          {/* Text */}
          <Text style={[styles.headline, { color: colors.primary }]}>
            {headline}
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {sub}
          </Text>

          {/* Stars */}
          <Text style={styles.stars}>⭐ ⭐ ⭐ ⭐ ⭐</Text>

          {/* Button */}
          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              SEE MY STATS →
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  emojiRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
  },
  headline: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  stars: {
    fontSize: 20,
    letterSpacing: 4,
    marginVertical: 4,
  },
  btn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
