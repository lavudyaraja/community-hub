// Push admin database schema to Neon PostgreSQL
// Usage: npx tsx scripts/push-admin-schema.ts

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

async function pushAdminSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pushing admin database schema to Neon PostgreSQL...');
    console.log('📡 Connecting to database...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Create admins table
    console.log('📝 Creating admins table...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          admin_role VARCHAR(50) NOT NULL CHECK (admin_role IN ('super_admin', 'validator_admin')),
          country VARCHAR(100),
          account_status VARCHAR(50) DEFAULT 'pending' CHECK (account_status IN ('active', 'pending', 'suspended')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created admins table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Admins table already exists');
      } else {
        console.error('❌ Error creating admins table:', err.message);
        throw err;
      }
    }
    
    // Create admin_actions table
    console.log('📝 Creating admin_actions table...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS admin_actions (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          action_type VARCHAR(100) NOT NULL,
          target_type VARCHAR(50),
          target_id VARCHAR(255),
          description TEXT,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created admin_actions table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Admin_actions table already exists');
      } else {
        console.error('❌ Error creating admin_actions table:', err.message);
        throw err;
      }
    }
    
    // Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      { name: 'idx_admins_email', query: 'CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)' },
      { name: 'idx_admins_admin_role', query: 'CREATE INDEX IF NOT EXISTS idx_admins_admin_role ON admins(admin_role)' },
      { name: 'idx_admins_account_status', query: 'CREATE INDEX IF NOT EXISTS idx_admins_account_status ON admins(account_status)' },
      { name: 'idx_admin_actions_admin_id', query: 'CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id)' },
      { name: 'idx_admin_actions_created_at', query: 'CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at)' },
      { name: 'idx_admin_actions_action_type', query: 'CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON admin_actions(action_type)' }
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
      console.log('✅ Created update_updated_at_column function');
    } catch (err: any) {
      console.error('❌ Error creating function:', err.message);
    }
    
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
        CREATE TRIGGER update_admins_updated_at
            BEFORE UPDATE ON admins
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Created trigger for admins.updated_at');
    } catch (err: any) {
      console.error('❌ Error creating trigger:', err.message);
    }
    
    console.log('\n🎉 Admin database schema pushed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Admins table');
    console.log('   ✅ Admin_actions table');
    console.log('   ✅ Indexes');
    console.log('   ✅ Triggers');
    
  } catch (error: any) {
    console.error('❌ Error pushing admin schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushAdminSchema();
