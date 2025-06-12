import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '@/constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => ({
    borderWidth: 1,
    borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    minHeight: 48,
  });

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: SIZES.sm,
  });

  const getLabelStyle = (): TextStyle => ({
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  });

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={{ color: COLORS.error }}> *</Text>}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: SIZES.sm }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[getInputStyle(), inputStyle]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={COLORS.textTertiary}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{ marginLeft: SIZES.sm }}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {hint && !error && (
        <Text style={styles.hintText}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
  hintText: {
    fontSize: SIZES.caption,
    fontFamily: FONTS.regular,
    color: COLORS.textTertiary,
    marginTop: SIZES.xs,
  },
});

export default Input;