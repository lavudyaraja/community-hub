// Database initialization script
// Run with: npx tsx scripts/init-db.ts

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
// Load environment variables from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, use process.env directly
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local');
  console.error('Please create .env.local file with your Neon database connection string');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initializing database schema...');
    console.log('📡 Connecting to Neon PostgreSQL...');
    
    // Test connection
    await client.query('SELECT NOW()');
    console.log('✅ Connected to database successfully');
    
    // Read schema file
    const schemaPath = join(process.cwd(), 'src', 'database', 'schema.sql');
    console.log(`📄 Reading schema from: ${schemaPath}`);
    
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
          console.log(`✅ [${i + 1}/${statements.length}] Executed: ${preview}...`);
          successCount++;
        } catch (err: any) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
            console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
            skippedCount++;
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Error: ${err.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            errorCount++;
          }
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Database schema initialized successfully!');
    } else {
      console.log('\n⚠️  Some errors occurred. Please check the output above.');
    }
    
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
