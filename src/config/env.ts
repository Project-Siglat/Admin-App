// Environment variables validation and configuration
// This file ensures all required environment variables are present

interface EnvironmentConfig {
  apiUrl: string;
  devHost?: boolean;
  devPort?: number;
  appName?: string;
  systemName?: string;
  region?: string;
}

// Required environment variables
const requiredEnvVars = [
  'PUBLIC_API_URL'
];

// Validate required environment variables
const validateEnvironment = (): void => {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.\n' +
      'See .env.example for reference.'
    );
  }
};

// Validate and export environment configuration
const createEnvironmentConfig = (): EnvironmentConfig => {
  validateEnvironment();
  
  return {
    apiUrl: import.meta.env.PUBLIC_API_URL,
    devHost: import.meta.env.VITE_DEV_HOST === 'true',
    devPort: import.meta.env.VITE_DEV_PORT ? parseInt(import.meta.env.VITE_DEV_PORT, 10) : undefined,
    appName: import.meta.env.VITE_APP_NAME,
    systemName: import.meta.env.VITE_SYSTEM_NAME,
    region: import.meta.env.VITE_REGION
  };
};

// Export validated configuration
export const ENV_CONFIG = createEnvironmentConfig();

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