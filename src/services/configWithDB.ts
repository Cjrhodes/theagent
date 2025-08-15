// Simple cache management for API keys
let apiKeyCache: { [key: string]: string } = {};

export function clearAPIKeyCache() {
  apiKeyCache = {};
}

export function getCachedAPIKey(serviceName: string): string | null {
  return apiKeyCache[serviceName] || null;
}

export function setCachedAPIKey(serviceName: string, apiKey: string) {
  apiKeyCache[serviceName] = apiKey;
}