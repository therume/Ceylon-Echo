import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const ink = '#8e4e26';

export function HeritageBackground() {
  const { width, height } = useWindowDimensions();
  const compassSize = Math.min(width * 0.56, 250);
  return (
    <View pointerEvents="none" style={styles.background}>
      <View style={[styles.stain, styles.stainTopRight]} />
      <View style={[styles.stain, styles.stainLeft]} />
      <View style={[styles.stain, styles.stainBottomRight]} />
      <View style={[styles.mapContour, styles.contourOne]} />
      <View style={[styles.mapContour, styles.contourTwo]} />
      <View style={[styles.mapContour, styles.contourThree]} />
      <View
        accessible={false}
        style={[
          styles.compass,
          {
            left: width * 0.04,
            top: height * 0.58,
            width: compassSize,
            height: compassSize,
            borderRadius: compassSize / 2,
          },
        ]}>
        <View
          style={[
            styles.compassInnerRing,
            {
              top: compassSize * 0.09,
              left: compassSize * 0.09,
              width: compassSize * 0.82,
              height: compassSize * 0.82,
              borderRadius: compassSize / 2,
            },
          ]}
        />
        <View style={[styles.compassRay, styles.rayVertical]} />
        <View style={[styles.compassRay, styles.rayHorizontal]} />
        <View
          style={[
            styles.compassStar,
            { width: compassSize * 0.6, height: compassSize * 0.6 },
          ]}
        />
        <View
          style={[
            styles.compassStarCutout,
            { width: compassSize * 0.39, height: compassSize * 0.39 },
          ]}
        />
        <View
          style={[
            styles.compassHub,
            {
              width: compassSize * 0.15,
              height: compassSize * 0.15,
              borderRadius: compassSize * 0.08,
            },
          ]}
        />
        <Text style={[styles.direction, styles.directionNorth]}>N</Text>
        <Text style={[styles.direction, styles.directionEast]}>E</Text>
        <Text style={[styles.direction, styles.directionSouth]}>S</Text>
        <Text style={[styles.direction, styles.directionWest]}>W</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    backgroundColor: '#f1e2c1',
  },
  stain: {
    position: 'absolute',
    backgroundColor: '#c99c5c',
    opacity: 0.08,
  },
  stainTopRight: {
    top: '-7%',
    right: '-12%',
    width: '66%',
    height: '26%',
    borderRadius: 180,
    transform: [{ rotate: '-22deg' }],
  },
  stainLeft: {
    top: '25%',
    left: '-22%',
    width: '66%',
    height: '21%',
    borderRadius: 160,
    transform: [{ rotate: '-37deg' }],
  },
  stainBottomRight: {
    right: '-17%',
    bottom: '-4%',
    width: '67%',
    height: '25%',
    borderRadius: 180,
    transform: [{ rotate: '-32deg' }],
  },
  mapContour: {
    position: 'absolute',
    width: '76%',
    height: '21%',
    borderWidth: 1,
    borderColor: ink,
    borderRadius: 180,
    opacity: 0.075,
  },
  contourOne: {
    top: '9%',
    left: '30%',
    transform: [{ rotate: '-24deg' }],
  },
  contourTwo: {
    top: '13%',
    left: '24%',
    transform: [{ rotate: '-24deg' }],
  },
  contourThree: {
    top: '17%',
    left: '18%',
    transform: [{ rotate: '-24deg' }],
  },
  compass: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ink,
    opacity: 0.14,
  },
  compassInnerRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: ink,
  },
  compassRay: {
    position: 'absolute',
    backgroundColor: ink,
  },
  rayVertical: {
    width: 1,
    height: '88%',
  },
  rayHorizontal: {
    width: '88%',
    height: 1,
  },
  compassStar: {
    position: 'absolute',
    backgroundColor: ink,
    transform: [{ rotate: '45deg' }],
  },
  compassStarCutout: {
    position: 'absolute',
    backgroundColor: '#f1e2c1',
  },
  compassHub: {
    borderWidth: 2,
    borderColor: ink,
    backgroundColor: '#d9b779',
  },
  direction: {
    position: 'absolute',
    color: ink,
    fontFamily: 'serif',
    fontSize: 10,
    fontWeight: '700',
  },
  directionNorth: {
    top: '2%',
  },
  directionEast: {
    right: '3%',
  },
  directionSouth: {
    bottom: '2%',
  },
  directionWest: {
    left: '3%',
  },
});
