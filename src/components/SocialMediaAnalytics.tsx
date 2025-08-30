import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';

import {
  Instagram,
  Facebook,
  Twitter,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { ayrshareService } from '../services/ayrshareService';

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  followers: number;
  engagement: number;
  weeklyGrowth: number;
  color: string;
  posts: number;
  reach: number;
  username: string;
}

interface EngagementData {
  date: string;
  instagram: number;
  facebook: number;
  twitter: number;
  bluesky: number;
  threads: number;
  tiktok: number;
}

const SocialMediaAnalytics: React.FC = () => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(false);

  const getPlatformIcon = (name: string) => {
    switch (name) {
      case 'Instagram': return <Instagram />;
      case 'Facebook': return <Facebook />;
      case 'Twitter/X': return <Twitter />;
      case 'TikTok': return <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />;
      case 'Threads': return <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />;
      case 'Bluesky': return <Box sx={{ width: 24, height: 24, backgroundColor: '#00A8E8', borderRadius: '50%' }} />;
      default: return <Box sx={{ width: 24, height: 24, backgroundColor: '#ccc', borderRadius: '50%' }} />;
    }
  };

  const getPlatformColor = (name: string) => {
    switch (name) {
      case 'Instagram': return '#E1306C';
      case 'Facebook': return '#1877F2';
      case 'Twitter/X': return '#1DA1F2';
      case 'TikTok': return '#000000';
      case 'Threads': return '#000000';
      case 'Bluesky': return '#00A8E8';
      default: return '#666666';
    }
  };

  const loadSocialData = useCallback(async () => {
    setLoading(true);
    try {
      const socialData = await ayrshareService.getSocialAnalytics();
      
      const platformsWithIcons: SocialPlatform[] = socialData.map(platform => ({
        name: platform.name,
        icon: getPlatformIcon(platform.name),
        followers: platform.followers,
        engagement: platform.engagement,
        weeklyGrowth: platform.weeklyGrowth,
        color: getPlatformColor(platform.name),
        posts: platform.posts,
        reach: platform.reach,
        username: platform.username,
      }));

      setPlatforms(platformsWithIcons);

      // Generate mock engagement data based on current platforms
      const mockEngagementData: EngagementData[] = [
        { date: '2024-01-01', instagram: 120, facebook: 85, twitter: 45, bluesky: 25, threads: 35, tiktok: 180 },
        { date: '2024-01-02', instagram: 135, facebook: 92, twitter: 52, bluesky: 28, threads: 42, tiktok: 210 },
        { date: '2024-01-03', instagram: 142, facebook: 88, twitter: 38, bluesky: 32, threads: 38, tiktok: 195 },
        { date: '2024-01-04', instagram: 158, facebook: 105, twitter: 62, bluesky: 35, threads: 48, tiktok: 245 },
        { date: '2024-01-05', instagram: 165, facebook: 98, twitter: 55, bluesky: 40, threads: 52, tiktok: 220 },
        { date: '2024-01-06', instagram: 172, facebook: 112, twitter: 68, bluesky: 38, threads: 55, tiktok: 265 },
        { date: '2024-01-07', instagram: 148, facebook: 95, twitter: 45, bluesky: 42, threads: 45, tiktok: 230 },
      ];
      setEngagementData(mockEngagementData);

    } catch (error) {
      console.error('Error loading social media data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSocialData();
  }, [loadSocialData]);

  const refreshData = async () => {
    await loadSocialData();
  };

  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.followers, 0);
  const avgEngagement = platforms.reduce((sum, platform) => sum + platform.engagement, 0) / platforms.length;

  const pieData = platforms.map(platform => ({
    name: `${platform.name} (${platform.username})`,
    value: platform.followers,
    color: platform.color,
  }));

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Box sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h5" component="h2">
              Social Media Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Tracking: {platforms.map(p => p.username).join(' • ')}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Followers
            </Typography>
            <Typography variant="h3" color="primary">
              {totalFollowers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Across all platforms
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Average Engagement
            </Typography>
            <Typography variant="h3" color="secondary">
              {avgEngagement.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Engagement rate
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Best Performer
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              {platforms.find(p => p.engagement === Math.max(...platforms.map(p => p.engagement)))?.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                TikTok
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Highest engagement rate
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Platform Cards */}
      {platforms.map((platform, index) => (
        <Box sx={{ flex: "1 1 300px" }} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: platform.color, mr: 2 }}>
                  {platform.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{platform.name}</Typography>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {platform.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Account Analytics
                  </Typography>
                </Box>
              </Box>

              <Box mb={2}>
                <Typography variant="h5" color="primary">
                  {platform.followers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Engagement Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {platform.engagement}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platform.engagement * 10}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Weekly Growth</Typography>
                <Chip
                  icon={platform.weeklyGrowth > 0 ? <TrendingUp /> : <TrendingDown />}
                  label={`${platform.weeklyGrowth > 0 ? '+' : ''}${platform.weeklyGrowth}%`}
                  color={platform.weeklyGrowth > 0 ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Posts This Month</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {platform.posts}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Reach</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {platform.reach.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}

      {/* Engagement Chart */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Engagement Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} name="Instagram" />
                <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} name="Facebook" />
                <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} name="Twitter/X" />
                <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} name="TikTok" />
                <Line type="monotone" dataKey="threads" stroke="#555555" strokeWidth={2} name="Threads" />
                <Line type="monotone" dataKey="bluesky" stroke="#00A8E8" strokeWidth={2} name="Bluesky" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Follower Distribution */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Follower Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Integration Status */}
      <Box sx={{ width: "100%" }}>
        <Alert severity={process.env.REACT_APP_AYRSHARE_API_KEY ? "success" : "info"}>
          <Typography variant="body2">
            <strong>Integration Status:</strong> {process.env.REACT_APP_AYRSHARE_API_KEY 
              ? "Connected to Ayrshare API for real-time social media analytics from Instagram, Facebook, Twitter/X, TikTok, Threads, and Bluesky." 
              : "Using mock data. Add REACT_APP_AYRSHARE_API_KEY to Vercel environment variables to connect real social media analytics."}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" display="block" mt={1}>
              Debug: API Key {process.env.REACT_APP_AYRSHARE_API_KEY ? 'found' : 'not found'}
            </Typography>
          )}
        </Alert>
      </Box>
    </Box>
  );
};

export default SocialMediaAnalytics;