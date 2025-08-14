import { sql } from '@vercel/postgres';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize database table
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT 'default_user',
        service_name VARCHAR(255) NOT NULL,
        api_key TEXT,
        additional_config JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, service_name)
      )
    `;
  } catch (error) {
    console.error('Database initialization error:', error);
  }
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
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    console.error('Missing required database environment variables');
    return res.status(500).json({ 
      error: 'Database configuration missing. Please configure Vercel Postgres environment variables.' 
    });
  }

  try {
    // Initialize database on first request
    await initializeDatabase();
  } catch (dbError) {
    console.error('Database initialization failed:', dbError);
    return res.status(500).json({ 
      error: 'Database connection failed. Please check your Vercel Postgres configuration.' 
    });
  }

  const { method } = req;
  const userId = 'default_user'; // For single user, you can make this dynamic later

  switch (method) {
    case 'GET':
      try {
        const { service } = req.query;
        
        if (service) {
          // Get specific service
          const result = await sql`
            SELECT * FROM user_settings 
            WHERE user_id = ${userId} AND service_name = ${service as string}
          `;
          
          if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
          }
          
          return res.status(200).json(result.rows[0]);
        } else {
          // Get all services
          const result = await sql`
            SELECT * FROM user_settings 
            WHERE user_id = ${userId}
          `;
          
          return res.status(200).json(result.rows);
        }
      } catch (error) {
        console.error('Get settings error:', error);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }

    case 'POST':
      try {
        const { serviceName, apiKey, additionalConfig } = req.body;
        
        if (!serviceName) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        // Upsert (insert or update)
        const result = await sql`
          INSERT INTO user_settings (user_id, service_name, api_key, additional_config, updated_at)
          VALUES (${userId}, ${serviceName}, ${apiKey || ''}, ${JSON.stringify(additionalConfig || {})}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, service_name) 
          DO UPDATE SET 
            api_key = EXCLUDED.api_key,
            additional_config = EXCLUDED.additional_config,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `;
        
        return res.status(200).json({ 
          success: true, 
          data: result.rows[0],
          message: 'Settings saved successfully'
        });
      } catch (error) {
        console.error('Save settings error:', error);
        return res.status(500).json({ error: 'Failed to save settings' });
      }

    case 'DELETE':
      try {
        const { service } = req.query;
        
        if (!service) {
          return res.status(400).json({ error: 'Service name is required' });
        }

        await sql`
          DELETE FROM user_settings 
          WHERE user_id = ${userId} AND service_name = ${service as string}
        `;
        
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