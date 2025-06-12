import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants';
import { hapticFeedback } from '@/utils';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const handlePress = () => {
    if (!disabled && !loading) {
      hapticFeedback('LIGHT');
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: SIZES.radiusMd,
      borderWidth: 1,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = SIZES.md;
        baseStyle.paddingVertical = SIZES.sm;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = SIZES.xl;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 56;
        break;
      default:
        baseStyle.paddingHorizontal = SIZES.lg;
        baseStyle.paddingVertical = SIZES.md;
        baseStyle.minHeight = 48;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled ? COLORS.gray300 : COLORS.primary;
        baseStyle.borderColor = disabled ? COLORS.gray300 : COLORS.primary;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled ? COLORS.gray100 : COLORS.secondary;
        baseStyle.borderColor = disabled ? COLORS.gray300 : COLORS.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = disabled ? COLORS.gray300 : COLORS.primary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderColor = 'transparent';
        break;
      case 'danger':
        baseStyle.backgroundColor = disabled ? COLORS.gray300 : COLORS.error;
        baseStyle.borderColor = disabled ? COLORS.gray300 : COLORS.error;
        break;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: FONTS.semiBold,
      textAlign: 'center',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = SIZES.bodySmall;
        break;
      case 'large':
        baseStyle.fontSize = SIZES.h6;
        break;
      default:
        baseStyle.fontSize = SIZES.body;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        baseStyle.color = disabled ? COLORS.gray500 : COLORS.background;
        break;
      case 'outline':
        baseStyle.color = disabled ? COLORS.gray400 : COLORS.primary;
        break;
      case 'ghost':
        baseStyle.color = disabled ? COLORS.gray400 : COLORS.primary;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.background}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={{ marginRight: SIZES.sm }}>{icon}</Text>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Text style={{ marginLeft: SIZES.sm }}>{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;