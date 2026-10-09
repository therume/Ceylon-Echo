import type { ReactNode } from 'react';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const TravelColors = {
  background: '#fbfaf5',
  surface: '#ffffff',
  ink: '#26382f',
  muted: '#777d75',
  green: '#285944',
  greenLight: '#e9f0eb',
  orange: '#bc603e',
  orangeLight: '#f7ece6',
  border: '#e8e7df',
  paleBlue: '#eef3f2',
  gold: '#b58a45',
  goldLight: '#f5efdf',
} as const;

export function ScreenFrame({
  children,
  title,
  subtitle,
  onProfile,
  contentStyle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onProfile?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const activeTab = pathname.includes('profile')
    ? 'profile'
    : [
        'explore',
        'map',
        'nearby',
        'suggested',
        'bookmarks',
        'downloads',
        'attraction',
        'audio-guide',
      ].some((route) => pathname.includes(route))
      ? 'explore'
      : 'home';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.brandHeader}>
          <View style={styles.brandIdentity}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>C</Text>
            </View>
            <Text style={styles.brandName}>Ceylon Echo</Text>
          </View>
          {onProfile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open user profile"
              onPress={onProfile}
              style={styles.profileButton}>
              <Text style={styles.profileButtonText}>A</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 7) }]}>
        <BottomBarButton
          active={activeTab === 'home'}
          icon="home"
          label="Home"
          onPress={() => router.replace('/(tabs)/home')}
        />
        <BottomBarButton
          active={activeTab === 'explore'}
          icon="map"
          label="Explore"
          onPress={() => router.replace('/(tabs)/explore')}
        />
        <BottomBarButton
          active={activeTab === 'profile'}
          icon="user"
          label="Profile"
          onPress={() => router.replace('/(tabs)/profile')}
        />
      </View>
    </SafeAreaView>
  );
}

function BottomBarButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: 'home' | 'map' | 'user';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.bottomBarButton, pressed && styles.pressed]}>
      <Feather
        color={active ? TravelColors.green : '#79837b'}
        name={icon}
        size={18}
        style={active && styles.bottomBarIconActive}
      />
      <Text style={[styles.bottomBarLabel, active && styles.bottomBarActive]}>{label}</Text>
    </Pressable>
  );
}

export function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  style,
  ...props
}: Omit<PressableProps, 'style'> & {
  title: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, style, pressed && styles.pressed]}
      {...props}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

export function SoftButton({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.softButton, style, pressed && styles.pressed]}>
      <Text style={styles.softButtonText}>{title}</Text>
    </Pressable>
  );
}

export function LandscapeArt({
  tone = 'green',
  style,
  label,
}: {
  tone?: 'green' | 'gold' | 'blue' | 'forest';
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const tones = artTones[tone];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label ?? 'Illustrated landscape placeholder; destination photo not available'}
      style={[styles.art, { backgroundColor: tones.sky }, style]}>
      <View style={[styles.artSun, { backgroundColor: tones.sun }]} />
      <View style={[styles.artHillBack, { backgroundColor: tones.back }]} />
      <View style={[styles.artHillFront, { backgroundColor: tones.front }]} />
      <View style={[styles.artGround, { backgroundColor: tones.ground }]} />
    </View>
  );
}

export function AttractionCard({
  title,
  location,
  category = 'Heritage',
  tone = 'green',
  compact = false,
  imageUrl,
  onPress,
}: {
  title: string;
  location: string;
  category?: string;
  tone?: 'green' | 'gold' | 'blue' | 'forest';
  compact?: boolean;
  imageUrl?: string | null;
  onPress?: () => void;
}) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.attractionCard,
        compact && styles.attractionCardCompact,
        pressed && styles.pressed,
      ]}>
      {showImage ? (
        <Image
          accessibilityLabel={`${title} photo`}
          contentFit="cover"
          onError={() => setFailedImageUrl(imageUrl ?? null)}
          source={{ uri: imageUrl ?? '' }}
          style={compact ? styles.compactArt : styles.cardArt}
          transition={180}
        />
      ) : (
        <LandscapeArt tone={tone} style={compact ? styles.compactArt : styles.cardArt} />
      )}
      <View style={styles.cardDetails}>
        <View style={styles.cardCopy}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.cardLocation}>
            {location} · {category}
          </Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </View>
    </Pressable>
  );
}

export function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText}>{label}</Text>
    </View>
  );
}

export function DetailRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  trailing?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.detailRow, pressed && onPress && styles.pressed]}>
      <View style={styles.detailIcon}>
        <Text style={styles.detailIconText}>{icon}</Text>
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailTitle}>{title}</Text>
        {subtitle ? <Text style={styles.detailSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <Text style={styles.detailTrailing}>{trailing}</Text> : null}
    </Pressable>
  );
}

const artTones = {
  green: { sky: '#cbd9d2', sun: '#ecd49c', back: '#869d83', front: '#4f735d', ground: '#315c49' },
  gold: { sky: '#e8d9ad', sun: '#f3c66d', back: '#b99a60', front: '#778454', ground: '#455d42' },
  blue: { sky: '#c4d8d7', sun: '#ead9a5', back: '#8faeaa', front: '#658f85', ground: '#456d63' },
  forest: { sky: '#ccd7c5', sun: '#efdaa0', back: '#8c9c68', front: '#53734c', ground: '#35563e' },
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TravelColors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
  },
  brandHeader: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: TravelColors.green,
  },
  brandMarkText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
  },
  brandName: {
    color: TravelColors.ink,
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700',
  },
  profileButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: TravelColors.goldLight,
  },
  profileButtonText: {
    color: TravelColors.green,
    fontSize: 14,
    fontWeight: '700',
  },
  screenTitle: {
    marginBottom: 4,
    color: TravelColors.ink,
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
  },
  screenSubtitle: {
    marginBottom: 16,
    color: TravelColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeading: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: TravelColors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionAction: {
    color: TravelColors.green,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: TravelColors.orange,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  softButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: TravelColors.surface,
  },
  softButtonText: {
    color: TravelColors.green,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  art: {
    overflow: 'hidden',
    position: 'relative',
  },
  artSun: {
    position: 'absolute',
    top: '13%',
    right: '14%',
    width: 19,
    height: 19,
    borderRadius: 10,
    opacity: 0.88,
  },
  artHillBack: {
    position: 'absolute',
    right: '-18%',
    bottom: '23%',
    left: '-13%',
    height: '42%',
    borderRadius: 100,
    transform: [{ rotate: '-7deg' }],
  },
  artHillFront: {
    position: 'absolute',
    right: '-12%',
    bottom: '-1%',
    left: '-16%',
    height: '43%',
    borderRadius: 100,
    transform: [{ rotate: '5deg' }],
  },
  artGround: {
    position: 'absolute',
    right: '-12%',
    bottom: '-28%',
    left: '-10%',
    height: '42%',
    borderRadius: 100,
  },
  attractionCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TravelColors.border,
    borderRadius: 15,
    backgroundColor: TravelColors.surface,
    shadowColor: TravelColors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  attractionCardCompact: {
    width: 184,
    marginRight: 12,
  },
  cardArt: {
    height: 148,
  },
  compactArt: {
    height: 108,
  },
  cardDetails: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  cardCopy: {
    flex: 1,
    paddingRight: 5,
  },
  cardTitle: {
    color: TravelColors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  cardLocation: {
    marginTop: 3,
    color: TravelColors.muted,
    fontSize: 10,
  },
  cardArrow: {
    color: TravelColors.green,
    fontSize: 22,
    lineHeight: 25,
  },
  infoPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: TravelColors.greenLight,
  },
  infoPillText: {
    color: TravelColors.green,
    fontSize: 10,
    fontWeight: '600',
  },
  detailRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#efeee8',
    gap: 12,
    paddingVertical: 9,
  },
  detailIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: TravelColors.greenLight,
  },
  detailIconText: {
    color: TravelColors.green,
    fontSize: 18,
    fontWeight: '600',
  },
  detailCopy: {
    flex: 1,
  },
  detailTitle: {
    color: TravelColors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  detailSubtitle: {
    marginTop: 3,
    color: TravelColors.muted,
    fontSize: 10,
  },
  detailTrailing: {
    color: TravelColors.green,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: TravelColors.border,
    paddingTop: 8,
    backgroundColor: '#ffffff',
    shadowColor: TravelColors.ink,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomBarButton: {
    minWidth: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bottomBarLabel: {
    color: '#79837b',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomBarIconActive: { borderRadius: 12, backgroundColor: TravelColors.greenLight },
  bottomBarActive: {
    color: TravelColors.orange,
  },
});
