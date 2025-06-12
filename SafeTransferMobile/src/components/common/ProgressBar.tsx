import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = COLORS.primary,
  backgroundColor = COLORS.gray200,
  showPercentage = false,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={style}>
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Text style={styles.percentageText}>{Math.round(clampedProgress)}%</Text>
        </View>
      )}
      <View
        style={[
          styles.container,
          {
            height,
            backgroundColor,
          },
        ]}
      >
        <View
          style={[
            styles.progress,
            {
              width: `${clampedProgress}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: SIZES.radiusFull,
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SIZES.xs,
  },
  percentageText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
});

export default ProgressBar;