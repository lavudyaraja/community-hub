// Push rejection fields to submissions table
// Usage: npx tsx scripts/push-rejection-fields.ts

import { Pool } from 'pg';

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

async function pushRejectionFields() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Adding rejection fields to submissions table...');
    console.log('📡 Connecting to database...');
    
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Add rejection_reason column
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(100)
      `);
      console.log('✅ Added rejection_reason column');
    } catch (err: any) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⏭️  rejection_reason column already exists');
      } else {
        console.error('❌ Error adding rejection_reason:', err.message);
      }
    }
    
    // Add rejection_feedback column
    try {
      await client.query(`
        ALTER TABLE submissions 
        ADD COLUMN IF NOT EXISTS rejection_feedback TEXT
      `);
      console.log('✅ Added rejection_feedback column');
    } catch (err: any) {
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('⏭️  rejection_feedback column already exists');
      } else {
        console.error('❌ Error adding rejection_feedback:', err.message);
      }
    }
    
    // Create index
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_submissions_rejection_reason 
        ON submissions(rejection_reason) 
        WHERE rejection_reason IS NOT NULL
      `);
      console.log('✅ Created index on rejection_reason');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  Index already exists');
      } else {
        console.error('❌ Error creating index:', err.message);
      }
    }
    
    console.log('\n🎉 Rejection fields added successfully!');
    console.log('📝 Rejection feedback feature is now available!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushRejectionFields();
