// Service for handling settings API calls
export interface SettingData {
  id?: number;
  user_id?: string;
  service_name: string;
  api_key?: string;
  additional_config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

class SettingsService {
  private baseUrl = '/api/settings';

  async saveSettings(serviceName: string, apiKey: string, additionalConfig?: Record<string, any>): Promise<SettingData> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceName,
          apiKey,
          additionalConfig,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  async getSettings(serviceName?: string): Promise<SettingData | SettingData[] | null> {
    try {
      const url = serviceName ? `${this.baseUrl}?service=${encodeURIComponent(serviceName)}` : this.baseUrl;
      
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          return serviceName ? null : [];
        }
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  async deleteSettings(serviceName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}?service=${encodeURIComponent(serviceName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete settings');
      }
    } catch (error) {
      console.error('Error deleting settings:', error);
      throw error;
    }
  }

  // Helper method to get API key for a specific service
  async getAPIKey(serviceName: string): Promise<string | null> {
    try {
      const setting = await this.getSettings(serviceName) as SettingData;
      return setting?.api_key || null;
    } catch (error) {
      return null;
    }
  }

  // Helper method to check if service is configured
  async isServiceConfigured(serviceName: string): Promise<boolean> {
    try {
      const setting = await this.getSettings(serviceName) as SettingData;
      return !!(setting?.api_key && setting.api_key.trim());
    } catch (error) {
      return false;
    }
  }
}

export const settingsService = new SettingsService();