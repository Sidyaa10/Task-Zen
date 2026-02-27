// Type-safe environment variable access for server code.

const requiredEnvVars = ['MONGODB_URI'] as const;

type RequiredEnvVars = (typeof requiredEnvVars)[number];

export function getEnvVar<T extends string = string>(key: RequiredEnvVars, fallback?: T): T {
  const value = process.env[key] as T | undefined;
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  return value;
}

if (typeof window === 'undefined') {
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      console.warn(`Missing environment variable: ${key}`);
    }
  }
}

