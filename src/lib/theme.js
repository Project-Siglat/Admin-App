// White and Red Material Theme Configuration
export const theme = {
  primary: '#d32f2f',     // Red
  primaryVariant: '#b71c1c', // Dark red
  secondary: '#ff5722',   // Orange-red
  secondaryVariant: '#e64a19',
  background: '#ffffff',  // White
  surface: '#ffffff',     // White
  error: '#f44336',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onBackground: '#000000',
  onSurface: '#000000',
  onError: '#ffffff'
};

export const customProperties = `
  --mdc-theme-primary: ${theme.primary};
  --mdc-theme-primary-variant: ${theme.primaryVariant};
  --mdc-theme-secondary: ${theme.secondary};
  --mdc-theme-secondary-variant: ${theme.secondaryVariant};
  --mdc-theme-background: ${theme.background};
  --mdc-theme-surface: ${theme.surface};
  --mdc-theme-error: ${theme.error};
  --mdc-theme-on-primary: ${theme.onPrimary};
  --mdc-theme-on-secondary: ${theme.onSecondary};
  --mdc-theme-on-background: ${theme.onBackground};
  --mdc-theme-on-surface: ${theme.onSurface};
  --mdc-theme-on-error: ${theme.onError};
  --mdc-typography-font-family: 'Roboto', sans-serif;
`;