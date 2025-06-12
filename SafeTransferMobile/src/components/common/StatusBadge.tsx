import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants';
import { getStatusColor, getStatusLabel } from '@/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  style,
  textStyle,
}) => {
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: `${statusColor}20`,
      borderColor: statusColor,
      borderWidth: 1,
      borderRadius: SIZES.radiusFull,
      alignSelf: 'flex-start',
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.sm;
        baseStyle.paddingVertical = SIZES.xs;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.lg;
        baseStyle.paddingVertical = SIZES.sm;
        break;
      default:
        baseStyle.paddingHorizontal = SIZES.md;
        baseStyle.paddingVertical = SIZES.xs;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: statusColor,
      fontFamily: FONTS.semiBold,
      textAlign: 'center',
    };

    switch (size) {
      case 'small':
        baseStyle.fontSize = SIZES.caption;
        break;
      case 'large':
        baseStyle.fontSize = SIZES.body;
        break;
      default:
        baseStyle.fontSize = SIZES.bodySmall;
    }

    return baseStyle;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{statusLabel}</Text>
    </View>
  );
};

export default StatusBadge;