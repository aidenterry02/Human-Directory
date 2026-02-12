/**
 * Theme colors and helper functions for dark/light mode
 */

export const lightTheme = {
  // Backgrounds
  primaryBg: '#f6f1ea',
  secondaryBg: '#fffaf2',
  tertiaryBg: '#efe4d6',
  
  // Text colors
  primaryText: '#1e1a16',
  secondaryText: '#4a4036',
  tertiaryText: '#7b6f63',
  
  // Borders
  primaryBorder: '#e6d7c6',
  secondaryBorder: '#d8c7b5',
  
  // Accent colors (stay the same)
  primary: '#e15b2d',
  success: '#2d8c7a',
  warning: '#f2c14e',
  danger: '#e25555',
  info: '#3c7be8',
  
  // Special colors
  lavender: '#d9c3a6',
  peach: '#f3b399',
};

export const darkTheme = {
  // Backgrounds
  primaryBg: '#0f0b09',
  secondaryBg: '#181311',
  tertiaryBg: '#231b17',
  
  // Text colors
  primaryText: '#f8f3ee',
  secondaryText: '#d2c6bc',
  tertiaryText: '#a5968b',
  
  // Borders
  primaryBorder: '#2b221e',
  secondaryBorder: '#3a2f2a',
  
  // Accent colors (stay the same)
  primary: '#e15b2d',
  success: '#2d8c7a',
  warning: '#f2c14e',
  danger: '#e25555',
  info: '#3c7be8',
  
  // Special colors
  lavender: '#8c7a67',
  peach: '#c08973',
};

export type Theme = typeof lightTheme;

export const getTheme = (isDarkMode: boolean): Theme => {
  return isDarkMode ? darkTheme : lightTheme;
};
