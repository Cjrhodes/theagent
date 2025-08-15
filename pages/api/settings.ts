import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase URL present:', !!supabaseUrl);
  console.log('Supabase Key present:', !!supabaseKey);
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Missing Supabase environment variables: URL=${!!supabaseUrl}, Key=${!!supabaseKey}`);
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = getSupabaseClient();
    
    // Simple test query to check if the table exists
    const { data, error } = await supabase
      .from('user_settings')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
}

// Initialize database table (simplified)
export async function initializeDatabase() {
  // Skip initialization since table is manually created
  return testDatabaseConnection();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for required environment variables
  if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing required Supabase URL environment variable');
    return res.status(500).json({ 
      error: 'Database configuration missing. Please configure Supabase environment variables.' 
    });
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required Supabase service role key');
    return res.status(500).json({ 
      error: 'Database configuration missing. Please configure Supabase service role key.' 
    });
  }

  // Test database connection
  const dbConnected = await initializeDatabase();
  if (!dbConnected) {
    console.error('Database connection failed, API will return error responses');
    return res.status(500).json({ 
      error: 'Database connection failed. Please check your Supabase configuration.' 
    });
  }

  const { method } = req;
  const userId = 'default_user'; // For single user, you can make this dynamic later

  switch (method) {
    case 'GET':
      try {
        const supabase = getSupabaseClient();
        const { service } = req.query;
        
        if (service) {
          // Get specific service
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .eq('service_name', service as string)
            .single();
          
          if (error && error.code === 'PGRST116') {
            return res.status(404).json({ error: 'Service not found' });
          }
          
          if (error) {
            throw error;
          }
          
          return res.status(200).json(data);
        } else {
          // Get all services
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId);
          
          if (error) {
            throw error;
          }
          
          return res.status(200).json(data || []);
        }
      } catch (error) {
        console.error('Get settings error:', error);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

    case 'POST':
      try {
        const supabase = getSupabaseClient();
        const { serviceName, apiKey, additionalConfig } = req.body;
        
        if (!serviceName) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        // Upsert (insert or update)
        const { data, error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            service_name: serviceName,
            api_key: apiKey || '',
            additional_config: additionalConfig || {},
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,service_name'
          })
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        return res.status(200).json({ 
          success: true, 
          data: data,
          message: 'Settings saved successfully'
        });
      } catch (error) {
        console.error('Save settings error:', error);
        return res.status(500).json({ error: 'Failed to save settings' });
      }

    case 'DELETE':
      try {
        const supabase = getSupabaseClient();
        const { service } = req.query;
        
        if (!service) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        const { error } = await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', userId)
          .eq('service_name', service as string);
        
        if (error) {
          throw error;
        }
        
        return res.status(200).json({ success: true, message: 'Settings deleted' });
      } catch (error) {
        console.error('Delete settings error:', error);
        return res.status(500).json({ error: 'Failed to delete settings' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}