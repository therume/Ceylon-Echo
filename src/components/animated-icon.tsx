import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, Keyframe, useReducedMotion } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  if (!visible) return null;

  const brand = (
    <View style={styles.splashBrand}>
      <View style={styles.splashMark}>
        <Text style={styles.splashMarkText}>CE</Text>
      </View>
      <Text style={styles.splashBrandName}>CEYLON ECHO</Text>
      <Text style={styles.splashBrandCaption}>A SRI LANKAN JOURNEY</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={FadeIn.duration(220).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}>
      {brand}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          if (reducedMotion) {
            setVisible(false);
          } else {
            setAnimate(true);
          }
        });
      }}
      style={styles.splashOverlay}>
      {brand}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '0deg' }],
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
    zIndex: 100,
  },
  image: {
    width: 76,
    height: 71,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#285944',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  splashBrand: {
    alignItems: 'center',
  },
  splashMark: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d7bd82',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  splashMarkText: {
    color: '#f2dca4',
    fontFamily: 'serif',
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: 1,
  },
  splashBrandName: {
    marginTop: 15,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  splashBrandCaption: {
    marginTop: 5,
    color: '#e7d9b5',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.4,
  },
});
