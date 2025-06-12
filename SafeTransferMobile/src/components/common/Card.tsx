import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
  shadow?: boolean;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = SIZES.md,
  margin = 0,
  shadow = true,
  borderRadius = SIZES.radiusMd,
}) => {
  const cardStyle: ViewStyle = {
    backgroundColor: COLORS.background,
    borderRadius,
    padding,
    margin,
    ...(shadow && {
      shadowColor: COLORS.gray900,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};

export default Card;