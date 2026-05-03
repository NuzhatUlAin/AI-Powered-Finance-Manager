import React, { useEffect } from 'react';
import { View, Animated } from 'react-native';
import colors from '../constants/colors';

const ProgressBar = ({ percent = 0 }) => {
  const widthAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(Math.max(percent, 0), 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent, widthAnim]);

  const getColor = () => {
    if (percent < 70) return colors.under;
    if (percent < 90) return colors.warning;
    return colors.over;
  };

  const widthPercent = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={{
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
        marginVertical: 8,
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: widthPercent,
          backgroundColor: getColor(),
          borderRadius: 3,
        }}
      />
    </View>
  );
};

export default ProgressBar;
