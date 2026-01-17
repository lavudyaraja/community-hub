import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/connection';
import { QueryResult } from 'pg';

// GET - Get all pending submissions for admin validation (optimized - no previews)
// Previews are fetched on-demand via separate endpoint to avoid timeouts
export async function GET(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    // Set a statement timeout to prevent long-running queries
    await client.query('SET statement_timeout = 5000'); // 5 second timeout
    
    // Fast query without preview data - previews are fetched on-demand
    const result: QueryResult = await client.query(`
      SELECT 
        id,
        file_name,
        file_type,
        file_size,
        user_email,
        status,
        created_at
      FROM submissions
      WHERE status IN ('pending', 'processing', 'submitted')
      ORDER BY created_at DESC
      LIMIT 50
    `);
    
    console.log(`Fetched ${result.rows.length} pending submissions (without previews)`);
    
    // Transform results - no preview data to keep it fast
    const submissions = result.rows.map((row) => ({
      id: row.id,
      fileName: row.file_name,
      file_name: row.file_name,
      fileType: row.file_type,
      file_type: row.file_type,
      fileSize: parseInt(row.file_size) || 0,
      file_size: parseInt(row.file_size) || 0,
      userEmail: row.user_email,
      user_email: row.user_email,
      status: row.status,
      date: row.created_at,
      created_at: row.created_at,
      preview: undefined // Preview will be fetched on-demand
    }));
    
    return NextResponse.json(submissions, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
    
  } catch (error: any) {
    console.error('Database error:', error.message);
    
    // Return empty array on error
    return NextResponse.json([], {
      status: 500,
      headers: {
        'X-Error': 'Database error - unable to fetch submissions',
      }
    });
    
  } finally {
    client.release();
  }
}

// Add this to your database migration or run once:
/*
CREATE INDEX IF NOT EXISTS idx_submissions_status_created 
ON submissions(status, created_at DESC) 
WHERE status IN ('pending', 'processing', 'submitted');

-- Analyze table to update statistics
ANALYZE submissions;
*/