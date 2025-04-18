import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Colors ---
// Using placeholder for primary, replace with actual accent color from frontend
const PRIMARY_COLOR = '#6C5CE7';
const BACKGROUND_COLOR = '#F8F7F5'; // From frontend tailwind.config.js
const CARD_BACKGROUND_COLOR = '#FFFFFF';
const TEXT_PRIMARY_COLOR = '#1E293B'; // Dark Gray/Black
const TEXT_SECONDARY_COLOR = '#64748B'; // Medium Gray
const WHITE_COLOR = '#FFFFFF';
const BLACK_COLOR = '#000000';
const SUCCESS_COLOR = '#4CAF50'; // Green
const WARNING_COLOR = '#FF9800'; // Orange
const ERROR_COLOR = '#F44336'; // Red
const INFO_COLOR = '#2196F3'; // Blue
const BORDER_COLOR = '#E5E7EB'; // Light Gray
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.08)'; // Subtle shadow color

export const colors = {
  primary: PRIMARY_COLOR,
  background: BACKGROUND_COLOR,
  cardBackground: CARD_BACKGROUND_COLOR,
  textPrimary: TEXT_PRIMARY_COLOR,
  textSecondary: TEXT_SECONDARY_COLOR,
  white: WHITE_COLOR,
  black: BLACK_COLOR,
  success: SUCCESS_COLOR,
  warning: WARNING_COLOR,
  error: ERROR_COLOR,
  info: INFO_COLOR,
  border: BORDER_COLOR,
  shadow: SHADOW_COLOR,
};

// --- Spacing (Inspired by Tailwind's 4px grid) ---
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20, // Adjusted from 24 for potentially tighter mobile layouts
  xl: 24, // Adjusted from 32
  xxl: 32,
};

// --- Typography ---
export const typography = {
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 18,
  fontSizeXl: 22,
  fontSizeXxl: 28,

  fontWeightLight: '300' as const,
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,
};

// --- Other Constants ---
export const constants = {
  screenWidth: width,
  screenHeight: height,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  borderRadiusSm: 4,
  borderRadiusMd: 8,
  borderRadiusLg: 16,
};

const theme = {
  colors,
  spacing,
  typography,
  constants,
};

export default theme;
