import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Colors ---
// Calm, professional, non-flashy admin palette
const PRIMARY_COLOR = '#2D3748'; // Deep cool gray
const PRIMARY_DARK_COLOR = '#23272F'; // Charcoal
const BACKGROUND_COLOR = '#F5F6FA'; // Soft gray
const CARD_BACKGROUND_COLOR = '#FFFFFF'; // White
const TEXT_PRIMARY_COLOR = '#23272F'; // Charcoal
const TEXT_SECONDARY_COLOR = '#6C7280'; // Muted gray
const WHITE_COLOR = '#FFFFFF';
const BLACK_COLOR = '#18181B'; // Neutral black
const ERROR_COLOR = '#D14343'; // Muted red
const BORDER_COLOR = '#E3E6EC'; // Light gray
const MUTED_BG_COLOR = '#F0F1F4'; // Extra soft gray
const SHADOW_COLOR = '#23272F0D'; // Very subtle shadow

// --- Muted accent colors for subtle status and highlights ---
const INFO_COLOR = '#4F6D7A'; // Muted blue
const SUCCESS_COLOR = '#3A7763'; // Muted green
const WARNING_COLOR = '#B0883B'; // Muted amber
const INFO_BG = '#E8F1F8';
const SUCCESS_BG = '#E6F4EF';
const WARNING_BG = '#F9F5E7';

export const colors = {
  primary: PRIMARY_COLOR,
  primaryDark: PRIMARY_DARK_COLOR,
  background: BACKGROUND_COLOR,
  cardBackground: CARD_BACKGROUND_COLOR,
  textPrimary: TEXT_PRIMARY_COLOR,
  textSecondary: TEXT_SECONDARY_COLOR,
  white: WHITE_COLOR,
  black: BLACK_COLOR,
  error: ERROR_COLOR,
  border: BORDER_COLOR,
  mutedBg: MUTED_BG_COLOR,
  shadow: SHADOW_COLOR,
  info: INFO_COLOR,
  success: SUCCESS_COLOR,
  warning: WARNING_COLOR,
  infoBg: INFO_BG,
  successBg: SUCCESS_BG,
  warningBg: WARNING_BG,
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
