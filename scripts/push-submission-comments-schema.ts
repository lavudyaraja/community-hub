// Push submission_comments table to Neon PostgreSQL
// Usage: npx tsx scripts/push-submission-comments-schema.ts

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

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

async function pushSubmissionCommentsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Pushing submission_comments table to Neon PostgreSQL...');
    console.log('📡 Connecting to database...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Connected successfully');
    console.log(`   Server time: ${testResult.rows[0].now}\n`);
    
    // Read SQL file
    const sqlPath = join(process.cwd(), 'scripts', 'add-submission-comments.sql');
    console.log(`📄 Reading SQL from: ${sqlPath}`);
    
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute statements one by one
    console.log('📝 Creating submission_comments table and related objects...\n');
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // 1. Create submission_comments table
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS submission_comments (
          id SERIAL PRIMARY KEY,
          submission_id VARCHAR(255) NOT NULL,
          author_email VARCHAR(255) NOT NULL,
          author_type VARCHAR(50) NOT NULL CHECK (author_type IN ('user', 'admin')),
          comment_text TEXT NOT NULL,
          parent_comment_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
          FOREIGN KEY (parent_comment_id) REFERENCES submission_comments(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ [1/5] Created submission_comments table');
      successCount++;
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [1/5] submission_comments table already exists');
        skippedCount++;
      } else {
        console.error('❌ [1/5] Error creating table:', err.message);
        errorCount++;
      }
    }
    
    // 2. Create indexes
    const indexes = [
      { name: 'idx_submission_comments_submission_id', sql: 'CREATE INDEX IF NOT EXISTS idx_submission_comments_submission_id ON submission_comments(submission_id)' },
      { name: 'idx_submission_comments_author_email', sql: 'CREATE INDEX IF NOT EXISTS idx_submission_comments_author_email ON submission_comments(author_email)' },
      { name: 'idx_submission_comments_parent_id', sql: 'CREATE INDEX IF NOT EXISTS idx_submission_comments_parent_id ON submission_comments(parent_comment_id)' },
      { name: 'idx_submission_comments_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_submission_comments_created_at ON submission_comments(created_at)' }
    ];
    
    for (let i = 0; i < indexes.length; i++) {
      try {
        await client.query(indexes[i].sql);
        console.log(`✅ [${i + 2}/5] Created index: ${indexes[i].name}`);
        successCount++;
      } catch (err: any) {
        if (err.message.includes('already exists')) {
          console.log(`⏭️  [${i + 2}/5] Index ${indexes[i].name} already exists`);
          skippedCount++;
        } else {
          console.error(`❌ [${i + 2}/5] Error creating index ${indexes[i].name}:`, err.message);
          errorCount++;
        }
      }
    }
    
    // 3. Create trigger
    try {
      await client.query(`
        DROP TRIGGER IF EXISTS update_submission_comments_updated_at ON submission_comments
      `);
      await client.query(`
        CREATE TRIGGER update_submission_comments_updated_at
          BEFORE UPDATE ON submission_comments
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column()
      `);
      console.log('✅ [5/5] Created trigger for updated_at');
      successCount++;
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('⏭️  [5/5] Trigger already exists');
        skippedCount++;
      } else {
        console.error('❌ [5/5] Error creating trigger:', err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 submission_comments table created successfully!');
      console.log('💬 Comments feature is now available!');
    } else {
      console.log('\n⚠️  Some errors occurred. Please check the output above.');
    }
    
  } catch (error: any) {
    console.error('❌ Error pushing schema:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

pushSubmissionCommentsSchema();
