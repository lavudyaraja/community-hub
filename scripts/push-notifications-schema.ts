// Push notifications database schema to Neon PostgreSQL
// Usage: npx tsx scripts/push-notifications-schema.ts

import { Pool } from 'pg';

// Use the same connection string as in connection.ts
const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function pushNotificationsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pushing notifications database schema to Neon PostgreSQL...');
    console.log('📡 Connecting to database...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Create notifications table
    console.log('📝 Creating notifications table...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(255) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('success', 'error', 'info', 'warning')),
          title VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT false,
          action_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created notifications table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Notifications table already exists');
      } else {
        console.error('❌ Error creating notifications table:', err.message);
        throw err;
      }
    }
    
    // Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      { name: 'idx_notifications_user_email', query: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email)' },
      { name: 'idx_notifications_read', query: 'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)' },
      { name: 'idx_notifications_created_at', query: 'CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)' },
      { name: 'idx_notifications_user_read', query: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_email, read)' }
    ];
    
    for (const index of indexes) {
      try {
        await client.query(index.query);
        console.log(`✅ Created index: ${index.name}`);
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log(`⏭️  Index ${index.name} already exists`);
        } else {
          console.error(`❌ Error creating index ${index.name}:`, err.message);
        }
      }
    }
    
    // Create trigger for updated_at
    console.log('📝 Creating trigger for updated_at...');
    try {
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      console.log('✅ Created/Updated update_updated_at_column function');
    } catch (err: any) {
      console.error('❌ Error creating function:', err.message);
    }
    
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
        CREATE TRIGGER update_notifications_updated_at
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Created trigger for notifications.updated_at');
    } catch (err: any) {
      console.error('❌ Error creating trigger:', err.message);
    }
    
    console.log('\n🎉 Notifications database schema pushed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Notifications table');
    console.log('   ✅ Indexes');
    console.log('   ✅ Triggers');
    
  } catch (error: any) {
    console.error('❌ Error pushing notifications schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushNotificationsSchema();
