/**
 * Islamic-inspired design system for Namaz Time App.
 * Deep teal primary + gold accent with warm cream / dark navy backgrounds.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#0D7377',
    primaryLight: '#14A3A8',
    accent: '#D4A843',
    accentLight: '#E8C96E',
    background: '#FAF5EE',
    card: '#FFFFFF',
    cardElevated: '#FFF8F0',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    icon: '#6B7280',
    tint: '#0D7377',
    success: '#10B981',
    successLight: '#D1FAE5',
    error: '#EF4444',
    overlay: 'rgba(0,0,0,0.4)',
    slider: '#0D7377',
    sliderTrack: '#E5E7EB',
  },
  dark: {
    primary: '#14B8A6',
    primaryLight: '#0D9488',
    accent: '#F5CC5E',
    accentLight: '#D4A843',
    background: '#000000',
    card: '#0A0A0A',
    cardElevated: '#121212',
    text: '#F0F0F0',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    border: '#2D3748',
    borderLight: '#374151',
    icon: '#9CA3AF',
    tint: '#14B8A6',
    success: '#34D399',
    successLight: '#064E3B',
    error: '#F87171',
    overlay: 'rgba(0,0,0,0.6)',
    slider: '#14B8A6',
    sliderTrack: '#374151',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
