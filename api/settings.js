import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'settings.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read settings from file
async function readSettings() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Write settings to file
async function writeSettings(settings) {
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to write settings:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const userId = 'default_user';

  try {
    switch (method) {
      case 'GET':
        const { service } = req.query;
        const allSettings = await readSettings();
        
        if (service) {
          // Get specific service
          const setting = allSettings.find(s => s.user_id === userId && s.service_name === service);
          if (!setting) {
            return res.status(404).json({ error: 'Service not found' });
          }
          return res.status(200).json(setting);
        } else {
          // Get all services for user
          const userSettings = allSettings.filter(s => s.user_id === userId);
          return res.status(200).json(userSettings);
        }

      case 'POST':
        const { serviceName, apiKey, additionalConfig } = req.body;
        
        if (!serviceName) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        const settings = await readSettings();
        const existingIndex = settings.findIndex(s => s.user_id === userId && s.service_name === serviceName);
        
        const settingData = {
          id: existingIndex >= 0 ? settings[existingIndex].id : Date.now(),
          user_id: userId,
          service_name: serviceName,
          api_key: apiKey || '',
          additional_config: additionalConfig || {},
          created_at: existingIndex >= 0 ? settings[existingIndex].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          // Update existing
          settings[existingIndex] = settingData;
        } else {
          // Add new
          settings.push(settingData);
        }

        await writeSettings(settings);
        
        return res.status(200).json({
          success: true,
          data: settingData,
          message: 'Settings saved successfully'
        });

      case 'DELETE':
        const { service: serviceToDelete } = req.query;
        
        if (!serviceToDelete) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        const currentSettings = await readSettings();
        const filteredSettings = currentSettings.filter(s => !(s.user_id === userId && s.service_name === serviceToDelete));
        
        await writeSettings(filteredSettings);
        
        return res.status(200).json({ success: true, message: 'Settings deleted' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}