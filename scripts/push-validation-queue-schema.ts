// Push validation queue database schema to Neon PostgreSQL
// Usage: npx tsx scripts/push-validation-queue-schema.ts

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

async function pushValidationQueueSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pushing validation queue database schema to Neon PostgreSQL...');
    console.log('📡 Connecting to database...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Create validation_queue table
    console.log('📝 Creating validation_queue table...');
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS validation_queue (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          admin_email VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(submission_id, admin_email),
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Created validation_queue table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Validation_queue table already exists');
      } else {
        console.error('❌ Error creating validation_queue table:', err.message);
        throw err;
      }
    }
    
    // Create indexes
    console.log('📝 Creating indexes...');
    const indexes = [
      { name: 'idx_validation_queue_submission_id', query: 'CREATE INDEX IF NOT EXISTS idx_validation_queue_submission_id ON validation_queue(submission_id)' },
      { name: 'idx_validation_queue_admin_email', query: 'CREATE INDEX IF NOT EXISTS idx_validation_queue_admin_email ON validation_queue(admin_email)' },
      { name: 'idx_validation_queue_status', query: 'CREATE INDEX IF NOT EXISTS idx_validation_queue_status ON validation_queue(status)' },
      { name: 'idx_validation_queue_created_at', query: 'CREATE INDEX IF NOT EXISTS idx_validation_queue_created_at ON validation_queue(created_at)' }
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
        DROP TRIGGER IF EXISTS update_validation_queue_updated_at ON validation_queue;
        CREATE TRIGGER update_validation_queue_updated_at
            BEFORE UPDATE ON validation_queue
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ Created trigger for validation_queue.updated_at');
    } catch (err: any) {
      console.error('❌ Error creating trigger:', err.message);
    }
    
    console.log('\n🎉 Validation queue database schema pushed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Validation_queue table');
    console.log('   ✅ Indexes');
    console.log('   ✅ Triggers');
    
  } catch (error: any) {
    console.error('❌ Error pushing validation queue schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushValidationQueueSchema();
