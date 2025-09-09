// Environment variables configuration

interface EnvironmentConfig {
  apiUrl: string;
  devHost?: boolean;
  devPort?: number;
  appName?: string;
  systemName?: string;
  region?: string;
}

// Export environment configuration
export const ENV_CONFIG: EnvironmentConfig = {
  apiUrl: import.meta.env.PUBLIC_API_URL,
  devHost: import.meta.env.VITE_DEV_HOST === 'true',
  devPort: import.meta.env.VITE_DEV_PORT ? parseInt(import.meta.env.VITE_DEV_PORT, 10) : undefined,
  appName: import.meta.env.VITE_APP_NAME,
  systemName: import.meta.env.VITE_SYSTEM_NAME,
  region: import.meta.env.VITE_REGION
};

// Type-safe environment access
export const getEnvVar = (key: keyof EnvironmentConfig): any => {
  return ENV_CONFIG[key];
};

// Helper for checking if we're in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};

// Helper for checking if we're in production mode
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};