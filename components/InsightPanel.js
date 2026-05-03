import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import colors from '../constants/colors';

const InsightPanel = ({ insight, loading, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const shimmerOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (insight || loading) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [insight, loading, slideAnim]);

  useEffect(() => {
    if (loading) {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );
      shimmerLoop.start();
      return () => shimmerLoop.stop();
    }
  }, [loading, shimmerOpacity]);

  const translateY = slideAnim.interpolate({
    inputRange: [-100, 0],
    outputRange: [-100, 0],
  });

  if (!insight && !loading) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      {loading ? (
        <Animated.View style={[styles.shimmer, { opacity: shimmerOpacity }]}>
          <View style={styles.shimmerBar} />
          <View style={styles.shimmerBar} />
        </Animated.View>
      ) : (
        <View style={styles.insightContainer}>
          <Text style={styles.sparkle}>*</Text>
          <Text style={styles.insightText}>{insight}</Text>
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.dismissBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  insightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.insightBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sparkle: {
    fontSize: 16,
    marginRight: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.text,
    lineHeight: 18,
  },
  dismissBtn: {
    fontSize: 18,
    color: colors.textLight,
    marginLeft: 8,
  },
  shimmer: {
    backgroundColor: colors.insightBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  shimmerBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginVertical: 4,
  },
});

export default InsightPanel;
