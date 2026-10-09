import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function ParchmentBackground({
  opacity = 0.42,
  washOpacity = 0.2,
}: {
  opacity?: number;
  washOpacity?: number;
}) {
  return (
    <View accessible={false} pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        contentFit="cover"
        source={require('../../assets/images/parchment-background.png')}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
      {washOpacity > 0 ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(251, 248, 239, ${washOpacity})` },
          ]}
        />
      ) : null}
    </View>
  );
}
