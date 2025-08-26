import axios from 'axios';

const AYRSHARE_API_URL = 'https://app.ayrshare.com/api';

interface AyrshareAnalytics {
  platform: string;
  analytics: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement_rate?: number;
    impressions?: number;
    reach?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    video_views?: number;
  };
  demographics?: {
    age?: object;
    gender?: object;
    location?: object;
  };
  growth?: {
    followers_change?: number;
    engagement_change?: number;
  };
}

interface SocialPlatformData {
  name: string;
  followers: number;
  engagement: number;
  weeklyGrowth: number;
  posts: number;
  reach: number;
  username: string;
}

class AyrshareService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.REACT_APP_AYRSHARE_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async getSocialAnalytics(): Promise<SocialPlatformData[]> {
    if (!this.apiKey) {
      console.warn('Ayrshare API key not found, using mock data');
      return this.getMockData();
    }

    try {
      const response = await axios.get(`${AYRSHARE_API_URL}/analytics/social`, {
        headers: this.getHeaders()
      });

      if (response.data && response.data.analytics) {
        return this.transformAyrshareData(response.data.analytics);
      }

      return this.getMockData();
    } catch (error) {
      console.error('Error fetching Ayrshare analytics:', error);
      return this.getMockData();
    }
  }

  async getPostAnalytics(postId?: string, platform?: string) {
    if (!this.apiKey) {
      return null;
    }

    try {
      const params = new URLSearchParams();
      if (postId) params.append('id', postId);
      if (platform) params.append('platforms', platform);

      const response = await axios.get(`${AYRSHARE_API_URL}/analytics/post?${params}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching post analytics:', error);
      return null;
    }
  }

  private transformAyrshareData(analyticsData: AyrshareAnalytics[]): SocialPlatformData[] {
    const platformMapping: { [key: string]: string } = {
      'instagram': 'Instagram',
      'facebook': 'Facebook', 
      'twitter': 'Twitter/X',
      'x': 'Twitter/X',
      'tiktok': 'TikTok',
      'threads': 'Threads',
      'bluesky': 'Bluesky'
    };

    return analyticsData.map(data => {
      const platformName = platformMapping[data.platform.toLowerCase()] || data.platform;
      
      return {
        name: platformName,
        followers: data.analytics.followers || 0,
        engagement: this.calculateEngagementRate(data.analytics),
        weeklyGrowth: data.growth?.followers_change || 0,
        posts: data.analytics.posts || 0,
        reach: data.analytics.reach || data.analytics.impressions || 0,
        username: this.getUsernameForPlatform(data.platform.toLowerCase())
      };
    });
  }

  private calculateEngagementRate(analytics: AyrshareAnalytics['analytics']): number {
    if (analytics.engagement_rate) {
      return analytics.engagement_rate;
    }

    const totalEngagements = (analytics.likes || 0) + 
                           (analytics.comments || 0) + 
                           (analytics.shares || 0) + 
                           (analytics.saves || 0);
    
    const reach = analytics.reach || analytics.impressions || analytics.followers || 1;
    
    return reach > 0 ? (totalEngagements / reach) * 100 : 0;
  }

  private getUsernameForPlatform(platform: string): string {
    const usernames: { [key: string]: string } = {
      'instagram': process.env.REACT_APP_INSTAGRAM_USERNAME || 'kathleen_rhodes_author',
      'facebook': process.env.REACT_APP_FACEBOOK_PAGE || 'KathleenRhodesAuthor',
      'twitter': process.env.REACT_APP_TWITTER_HANDLE || '@KathleenRhodes',
      'x': process.env.REACT_APP_TWITTER_HANDLE || '@KathleenRhodes',
      'tiktok': process.env.REACT_APP_TIKTOK_USERNAME || '@kathleenrhodes',
      'threads': process.env.REACT_APP_THREADS_USERNAME || 'kathleen_rhodes_author',
      'bluesky': process.env.REACT_APP_BLUESKY_HANDLE || '@kathleenrhodes.bsky.social'
    };

    return usernames[platform] || '';
  }

  private getMockData(): SocialPlatformData[] {
    return [
      {
        name: 'Instagram',
        followers: 2847,
        engagement: 4.2,
        weeklyGrowth: 12.5,
        posts: 45,
        reach: 18500,
        username: process.env.REACT_APP_INSTAGRAM_USERNAME || 'kathleen_rhodes_author'
      },
      {
        name: 'Facebook',
        followers: 1523,
        engagement: 3.8,
        weeklyGrowth: 8.2,
        posts: 32,
        reach: 12300,
        username: process.env.REACT_APP_FACEBOOK_PAGE || 'KathleenRhodesAuthor'
      },
      {
        name: 'Twitter/X',
        followers: 892,
        engagement: 2.1,
        weeklyGrowth: -2.3,
        posts: 78,
        reach: 8500,
        username: process.env.REACT_APP_TWITTER_HANDLE || '@KathleenRhodes'
      },
      {
        name: 'TikTok',
        followers: 456,
        engagement: 6.7,
        weeklyGrowth: 25.8,
        posts: 12,
        reach: 15600,
        username: process.env.REACT_APP_TIKTOK_USERNAME || '@kathleenrhodes'
      },
      {
        name: 'Threads',
        followers: 234,
        engagement: 3.4,
        weeklyGrowth: 15.2,
        posts: 23,
        reach: 4200,
        username: process.env.REACT_APP_THREADS_USERNAME || 'kathleen_rhodes_author'
      },
      {
        name: 'Bluesky',
        followers: 167,
        engagement: 5.1,
        weeklyGrowth: 18.7,
        posts: 15,
        reach: 2800,
        username: process.env.REACT_APP_BLUESKY_HANDLE || '@kathleenrhodes.bsky.social'
      }
    ];
  }
}

export const ayrshareService = new AyrshareService();
export type { SocialPlatformData, AyrshareAnalytics };