/**
 * Responsive design utilities for different screen sizes
 */

import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen size categories
export const screenSize = {
  width,
  height,
  isSmallPhone: width < 375,
  isPhone: width < 768,
  isTablet: width >= 768,
};

// Scale factor based on screen width (375 is considered base)
export const scale = (size: number): number => {
  return (width / 375) * size;
};

// Responsive font sizes
export const fontSize = {
  xs: scale(10),
  sm: scale(12),
  base: scale(14),
  lg: scale(16),
  xl: scale(18),
  '2xl': scale(20),
  '3xl': scale(24),
  '4xl': scale(28),
  '5xl': scale(32),
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
  '3xl': scale(32),
};

// Responsive border radius
export const borderRadius = {
  sm: scale(8),
  md: scale(12),
  base: scale(12),
  lg: scale(16),
  xl: scale(20),
  '2xl': scale(24),
};

// Responsive shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.08,
    shadowRadius: scale(4),
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(8),
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.15,
    shadowRadius: scale(12),
    elevation: 6,
  },
};

// Get layout based on screen size
export const getLayoutConfig = () => {
  if (screenSize.isTablet) {
    return {
      columnsPerRow: 2,
      itemSpacing: spacing.lg,
      containerPadding: spacing.xl,
    };
  }
  return {
    columnsPerRow: 1,
    itemSpacing: spacing.md,
    containerPadding: spacing.lg,
  };
};

// Responsive padding
export const responsivePadding = {
  screen: screenSize.isTablet ? spacing.xl : spacing.lg,
  card: screenSize.isTablet ? spacing.lg : spacing.md,
  button: screenSize.isTablet ? scale(14) : scale(12),
};

// Responsive dimensions for cards
export const cardDimensions = {
  minHeight: screenSize.isTablet ? 200 : 140,
  height: screenSize.isTablet ? 'auto' : 140,
};

// Max width for content on large screens
export const maxContentWidth = screenSize.isTablet ? 600 : '100%';
