// Push database schema to Neon PostgreSQL
// Usage: npx tsx scripts/push-schema.ts

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Get DATABASE_URL from environment or use the provided one
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

async function pushSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pushing database schema to Neon PostgreSQL...');
    console.log('📡 Connecting to database...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Execute statements one by one
    console.log('📝 Creating tables and schema...\n');
    
    // 1. Create users table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          password VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ [1/9] Created users table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [1/9] Users table already exists');
      } else {
        console.error('❌ [1/9] Error creating users table:', err.message);
      }
    }
    
    // 2. Create submissions table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id VARCHAR(255) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          file_name VARCHAR(500) NOT NULL,
          file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'audio', 'video', 'document')),
          file_size BIGINT NOT NULL,
          status VARCHAR(50) DEFAULT 'successful',
          preview TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ [2/9] Created submissions table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [2/9] Submissions table already exists');
      } else {
        console.error('❌ [2/9] Error creating submissions table:', err.message);
      }
    }
    
    // 3. Create indexes
    const indexes = [
      { name: 'idx_submissions_user_email', table: 'submissions', column: 'user_email' },
      { name: 'idx_submissions_file_type', table: 'submissions', column: 'file_type' },
      { name: 'idx_submissions_created_at', table: 'submissions', column: 'created_at' }
    ];
    
    for (let i = 0; i < indexes.length; i++) {
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS ${indexes[i].name} ON ${indexes[i].table}(${indexes[i].column})
        `);
        console.log(`✅ [${i + 3}/9] Created index ${indexes[i].name}`);
      } catch (err: any) {
        console.log(`⏭️  [${i + 3}/9] Index ${indexes[i].name} already exists`);
      }
    }
    
    // 4. Create function
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
      console.log('✅ [6/9] Created update_updated_at_column function');
    } catch (err: any) {
      console.log('⏭️  [6/9] Function already exists');
    }
    
    // 5. Create triggers
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ [7/9] Created trigger for users table');
    } catch (err: any) {
      console.log('⏭️  [7/9] Trigger for users already exists');
    }
    
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
        CREATE TRIGGER update_submissions_updated_at
            BEFORE UPDATE ON submissions
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ [8/9] Created trigger for submissions table');
    } catch (err: any) {
      console.log('⏭️  [8/9] Trigger for submissions already exists');
    }
    
    // 6. Create images table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS images (
          id VARCHAR(255) PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          file_name VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          preview_data TEXT NOT NULL,
          width INTEGER,
          height INTEGER,
          mime_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ [9/13] Created images table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [9/13] Images table already exists');
      } else {
        console.error('❌ [9/13] Error creating images table:', err.message);
      }
    }
    
    // 7. Create videos table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS videos (
          id VARCHAR(255) PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          file_name VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          preview_data TEXT NOT NULL,
          duration INTEGER,
          mime_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ [10/13] Created videos table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [10/13] Videos table already exists');
      } else {
        console.error('❌ [10/13] Error creating videos table:', err.message);
      }
    }
    
    // 8. Create audio_files table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS audio_files (
          id VARCHAR(255) PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          file_name VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          preview_data TEXT NOT NULL,
          duration INTEGER,
          mime_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ [11/13] Created audio_files table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [11/13] Audio_files table already exists');
      } else {
        console.error('❌ [11/13] Error creating audio_files table:', err.message);
      }
    }
    
    // 9. Create web_data table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS web_data (
          id VARCHAR(255) PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          file_name VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          preview_data TEXT,
          file_extension VARCHAR(50),
          mime_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ [12/15] Created web_data table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [12/15] Web_data table already exists');
      } else {
        console.error('❌ [12/15] Error creating web_data table:', err.message);
      }
    }
    
    // 10. Create admins table
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
      console.log('✅ [13/15] Created admins table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [13/15] Admins table already exists');
      } else {
        console.error('❌ [13/15] Error creating admins table:', err.message);
      }
    }
    
    // 11. Create admin_actions table
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
      console.log('✅ [14/15] Created admin_actions table');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [14/15] Admin_actions table already exists');
      } else {
        console.error('❌ [14/15] Error creating admin_actions table:', err.message);
      }
    }
    
    // 12. Create indexes for new tables
    const newIndexes = [
      { name: 'idx_images_submission_id', table: 'images', column: 'submission_id' },
      { name: 'idx_images_user_email', table: 'images', column: 'user_email' },
      { name: 'idx_videos_submission_id', table: 'videos', column: 'submission_id' },
      { name: 'idx_videos_user_email', table: 'videos', column: 'user_email' },
      { name: 'idx_audio_submission_id', table: 'audio_files', column: 'submission_id' },
      { name: 'idx_audio_user_email', table: 'audio_files', column: 'user_email' },
      { name: 'idx_web_data_submission_id', table: 'web_data', column: 'submission_id' },
      { name: 'idx_web_data_user_email', table: 'web_data', column: 'user_email' },
      { name: 'idx_submissions_status', table: 'submissions', column: 'status' },
      { name: 'idx_admins_email', table: 'admins', column: 'email' },
      { name: 'idx_admins_admin_role', table: 'admins', column: 'admin_role' },
      { name: 'idx_admins_account_status', table: 'admins', column: 'account_status' },
      { name: 'idx_admin_actions_admin_id', table: 'admin_actions', column: 'admin_id' },
      { name: 'idx_admin_actions_created_at', table: 'admin_actions', column: 'created_at' },
      { name: 'idx_admin_actions_action_type', table: 'admin_actions', column: 'action_type' }
    ];
    
    for (let i = 0; i < newIndexes.length; i++) {
      try {
        await client.query(`
          CREATE INDEX IF NOT EXISTS ${newIndexes[i].name} ON ${newIndexes[i].table}(${newIndexes[i].column})
        `);
        console.log(`✅ [${15 + i}/30] Created index ${newIndexes[i].name}`);
      } catch (err: any) {
        console.log(`⏭️  [${15 + i}/30] Index ${newIndexes[i].name} already exists`);
      }
    }
    
    // 13. Create triggers for new tables
    const triggerTables = ['images', 'videos', 'audio_files', 'web_data', 'admins'];
    for (let i = 0; i < triggerTables.length; i++) {
      try {
        await client.query(`
          DROP TRIGGER IF EXISTS update_${triggerTables[i]}_updated_at ON ${triggerTables[i]};
          CREATE TRIGGER update_${triggerTables[i]}_updated_at
              BEFORE UPDATE ON ${triggerTables[i]}
              FOR EACH ROW
              EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log(`✅ [${30 + i}/35] Created trigger for ${triggerTables[i]} table`);
      } catch (err: any) {
        console.log(`⏭️  [${30 + i}/35] Trigger for ${triggerTables[i]} already exists`);
      }
    }
    
    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'submissions', 'images', 'videos', 'audio_files', 'web_data', 'admins', 'admin_actions')
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Check indexes
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'submissions'
    `);
    
    if (indexesResult.rows.length > 0) {
      console.log(`\n✅ Found ${indexesResult.rows.length} indexes on submissions table:`);
      indexesResult.rows.forEach(row => {
        console.log(`   - ${row.indexname}`);
      });
    }
    
    // Check triggers
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);
    
    if (triggersResult.rows.length > 0) {
      console.log(`\n✅ Found ${triggersResult.rows.length} triggers:`);
      triggersResult.rows.forEach(row => {
        console.log(`   - ${row.trigger_name} on ${row.event_object_table}`);
      });
    }
    
    console.log('\n🎉 Database schema pushed successfully!');
    console.log('✨ Your database is ready to use!');
    
  } catch (error: any) {
    console.error('❌ Error pushing schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushSchema();
