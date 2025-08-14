import { settingsService } from './settingsService';

// Cache for API keys to avoid repeated database calls
const apiKeyCache = new Map<string, string>();
const cacheExpiry = new Map<string, number>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get API key from database, localStorage, or env
const getAPIKey = async (serviceName: string, localStorageKey: string, envKey?: string): Promise<string> => {
  const cacheKey = serviceName;
  const now = Date.now();
  
  // Check cache first
  if (apiKeyCache.has(cacheKey) && (cacheExpiry.get(cacheKey) || 0) > now) {
    return apiKeyCache.get(cacheKey) || '';
  }
  
  try {
    // Try database first
    const dbKey = await settingsService.getAPIKey(serviceName);
    if (dbKey) {
      apiKeyCache.set(cacheKey, dbKey);
      cacheExpiry.set(cacheKey, now + CACHE_DURATION);
      return dbKey;
    }
  } catch (error) {
    console.warn(`Failed to fetch ${serviceName} from database:`, error);
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(localStorageKey);
    if (storedKey) {
      return storedKey;
    }
  }
  
  // Final fallback to environment variable
  return envKey ? (process.env[envKey] || '') : '';
};

// Synchronous helper for immediate access (uses cache or env vars)
const getAPIKeySync = (localStorageKey: string, envKey?: string): string => {
  // For immediate access, use localStorage or env vars
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(localStorageKey);
    if (storedKey) return storedKey;
  }
  return envKey ? (process.env[envKey] || '') : '';
};

// Clear cache when settings are updated
export const clearAPIKeyCache = () => {
  apiKeyCache.clear();
  cacheExpiry.clear();
};

// API Configuration with database support
export const API_CONFIG = {
  // AI Services
  anthropic: {
    get apiKey() { return getAPIKeySync('apiKey_Claude_AI', 'REACT_APP_ANTHROPIC_API_KEY'); },
    async getApiKeyAsync() { return getAPIKey('Claude AI', 'apiKey_Claude_AI', 'REACT_APP_ANTHROPIC_API_KEY'); },
    baseUrl: 'https://api.anthropic.com/v1',
  },
  openai: {
    get apiKey() { return getAPIKeySync('apiKey_GPT-4', 'REACT_APP_OPENAI_API_KEY') || getAPIKeySync('apiKey_DALL-E_3', 'REACT_APP_OPENAI_API_KEY'); },
    async getApiKeyAsync() { 
      const gpt4Key = await getAPIKey('GPT-4', 'apiKey_GPT-4', 'REACT_APP_OPENAI_API_KEY');
      if (gpt4Key) return gpt4Key;
      return getAPIKey('DALL-E 3', 'apiKey_DALL-E_3', 'REACT_APP_OPENAI_API_KEY');
    },
    baseUrl: 'https://api.openai.com/v1',
  },

  // Social Media APIs
  instagram: {
    get accessToken() { return getAPIKeySync('apiKey_Instagram', 'REACT_APP_INSTAGRAM_ACCESS_TOKEN'); },
    async getAccessTokenAsync() { return getAPIKey('Instagram', 'apiKey_Instagram', 'REACT_APP_INSTAGRAM_ACCESS_TOKEN'); },
    baseUrl: 'https://graph.instagram.com/v17.0',
  },
  facebook: {
    get accessToken() { return getAPIKeySync('apiKey_Facebook', 'REACT_APP_FACEBOOK_ACCESS_TOKEN'); },
    async getAccessTokenAsync() { return getAPIKey('Facebook', 'apiKey_Facebook', 'REACT_APP_FACEBOOK_ACCESS_TOKEN'); },
    baseUrl: 'https://graph.facebook.com/v17.0',
  },
  twitter: {
    get apiKey() { return getAPIKeySync('apiKey_Twitter_/_X', 'REACT_APP_TWITTER_API_KEY'); },
    get apiSecret() { return getAPIKeySync('apiSecret_Twitter_/_X', 'REACT_APP_TWITTER_API_SECRET'); },
    get accessToken() { return getAPIKeySync('accessToken_Twitter_/_X', 'REACT_APP_TWITTER_ACCESS_TOKEN'); },
    get accessSecret() { return getAPIKeySync('accessSecret_Twitter_/_X', 'REACT_APP_TWITTER_ACCESS_SECRET'); },
    async getApiKeyAsync() { return getAPIKey('Twitter / X', 'apiKey_Twitter_/_X', 'REACT_APP_TWITTER_API_KEY'); },
    baseUrl: 'https://api.twitter.com/2',
  },

  // Unified Social Media Services
  ayrshare: {
    get apiKey() { return getAPIKeySync('apiKey_Ayrshare', 'REACT_APP_AYRSHARE_API_KEY'); },
    async getApiKeyAsync() { return getAPIKey('Ayrshare', 'apiKey_Ayrshare', 'REACT_APP_AYRSHARE_API_KEY'); },
    baseUrl: 'https://app.ayrshare.com/api',
  },

  // Keep other services as-is with environment variables
  tiktok: {
    apiKey: process.env.REACT_APP_TIKTOK_API_KEY || '',
    baseUrl: 'https://open-api.tiktok.com/v1.3',
  },
  threads: {
    accessToken: process.env.REACT_APP_THREADS_ACCESS_TOKEN || '',
    baseUrl: 'https://graph.threads.net/v1.0',
  },
  bluesky: {
    identifier: process.env.REACT_APP_BLUESKY_IDENTIFIER || '',
    password: process.env.REACT_APP_BLUESKY_PASSWORD || '',
    baseUrl: 'https://bsky.social/xrpc',
  },
  midjourney: {
    apiKey: process.env.REACT_APP_MIDJOURNEY_API_KEY || '',
    baseUrl: 'https://api.midjourney.com/v1',
  },
  dalle: {
    apiKey: process.env.REACT_APP_DALL_E_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
  },
  stability: {
    apiKey: process.env.REACT_APP_STABILITY_API_KEY || '',
    baseUrl: 'https://api.stability.ai/v1',
  },
  buffer: {
    accessToken: process.env.REACT_APP_BUFFER_ACCESS_TOKEN || '',
    baseUrl: 'https://api.bufferapp.com/1',
  },
  hootsuite: {
    accessToken: process.env.REACT_APP_HOOTSUITE_ACCESS_TOKEN || '',
    baseUrl: 'https://platform.hootsuite.com/v1',
  },
  googleAnalytics: {
    id: process.env.REACT_APP_GOOGLE_ANALYTICS_ID || '',
  },
  facebookPixel: {
    id: process.env.REACT_APP_FACEBOOK_PIXEL_ID || '',
  },
  mailchimp: {
    apiKey: process.env.REACT_APP_MAILCHIMP_API_KEY || '',
    baseUrl: 'https://us1.api.mailchimp.com/3.0',
  },
  convertkit: {
    apiKey: process.env.REACT_APP_CONVERTKIT_API_KEY || '',
    baseUrl: 'https://api.convertkit.com/v3',
  },
  amazon: {
    apiKey: process.env.REACT_APP_AMAZON_API_KEY || '',
    baseUrl: 'https://webservices.amazon.com/paapi5',
  },
  bookbub: {
    apiKey: process.env.REACT_APP_BOOKBUB_API_KEY || '',
    baseUrl: 'https://partners.bookbub.com/api/v1',
  },
};

// Helper function to check if API keys are configured
export const isConfigured = async (service: keyof typeof API_CONFIG): Promise<boolean> => {
  const config = API_CONFIG[service];
  if (!config) return false;
  
  // Check async method first if available
  if ('getApiKeyAsync' in config && typeof config.getApiKeyAsync === 'function') {
    try {
      const key = await config.getApiKeyAsync();
      return !!(key && key.trim());
    } catch (error) {
      console.warn(`Failed to check configuration for ${service}:`, error);
    }
  }
  
  // Fallback to synchronous check
  return Object.entries(config).some(([key, value]) => {
    if (key === 'baseUrl') return false;
    if (typeof value === 'function') return false;
    if (typeof value === 'string') return value !== '';
    try {
      const actualValue = (config as any)[key];
      return actualValue && actualValue !== '';
    } catch {
      return false;
    }
  });
};

// Export both old and new config for backward compatibility
export { API_CONFIG as default };