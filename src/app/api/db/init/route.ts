import { NextResponse } from 'next/server';
import pool from '@/database/connection';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize database schema
export async function GET() {
  const client = await pool.connect();
  
  try {
    // Read schema file
    const schemaPath = join(process.cwd(), 'src', 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));
    
    const results = [];
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          results.push({ statement: statement.substring(0, 50) + '...', status: 'success' });
        } catch (err: any) {
          // Ignore "already exists" errors
          if (err.message.includes('already exists') || err.message.includes('duplicate')) {
            results.push({ statement: statement.substring(0, 50) + '...', status: 'skipped (already exists)' });
          } else {
            results.push({ statement: statement.substring(0, 50) + '...', status: 'error', error: err.message });
          }
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      results
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
