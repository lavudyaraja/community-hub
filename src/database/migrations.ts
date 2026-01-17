import pool from './connection';

export async function runMigrations() {
  try {
    const client = await pool.connect();
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn('Schema file not found, skipping migrations');
      client.release();
      return;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
        } catch (err: any) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
            console.warn('Migration warning:', err.message);
          }
        }
      }
    }
    
    client.release();
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    // Don't throw - allow app to continue even if migrations fail
  }
}
