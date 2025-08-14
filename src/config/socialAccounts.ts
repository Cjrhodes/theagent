// Social media account configuration
// Edit this file directly and redeploy to update accounts
export const SOCIAL_ACCOUNTS = {
  instagram: process.env.REACT_APP_INSTAGRAM_USERNAME || 'your_instagram_handle',
  facebook: process.env.REACT_APP_FACEBOOK_PAGE || 'your_facebook_page',
  twitter: process.env.REACT_APP_TWITTER_HANDLE || '@your_twitter_handle', 
  threads: process.env.REACT_APP_THREADS_USERNAME || 'your_threads_handle',
  tiktok: process.env.REACT_APP_TIKTOK_USERNAME || '@your_tiktok_handle',
  bluesky: process.env.REACT_APP_BLUESKY_HANDLE || '@your_handle.bsky.social'
};

// Helper to get account info
export const getSocialAccount = (platform: string): string => {
  const key = platform.toLowerCase().replace(/\s+/g, '_').replace('/_x', '') as keyof typeof SOCIAL_ACCOUNTS;
  return SOCIAL_ACCOUNTS[key] || '';
};