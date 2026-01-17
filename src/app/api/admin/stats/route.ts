import { NextRequest, NextResponse } from 'next/server';
import { getPendingSubmissions } from '@/database/submissions';
import pool from '@/database/connection';
import { PoolClient } from 'pg';

// Helper function to get a database client with retry logic
async function getDbClient(): Promise<PoolClient> {
  let retries = 3;
  let lastError: Error | undefined;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error: any) {
      lastError = error;
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw new Error(`Failed to connect to database after retries: ${lastError?.message || 'Unknown error'}`);
}

// GET - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const client = await getDbClient();
    
    try {
      // Get all submissions with status counts
      const submissionsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending' OR status = 'processing') as pending,
          COUNT(*) FILTER (WHERE status = 'validated' OR status = 'successful') as validated,
          COUNT(*) FILTER (WHERE status = 'rejected' OR status = 'failed') as rejected,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
        FROM submissions
      `;
      
      const submissionsResult = await client.query(submissionsQuery);
      const stats = submissionsResult.rows[0];
      
      // Get total users count
      const usersQuery = 'SELECT COUNT(*) as total FROM users';
      const usersResult = await client.query(usersQuery);
      const totalUsers = parseInt(usersResult.rows[0].total) || 0;
      
      // Get pending submissions for queue
      const pendingSubmissions = await getPendingSubmissions();
      
      return NextResponse.json({
        totalSubmissions: parseInt(stats.total) || 0,
        pendingSubmissions: parseInt(stats.pending) || 0,
        validatedSubmissions: parseInt(stats.validated) || 0,
        rejectedSubmissions: parseInt(stats.rejected) || 0,
        totalVolunteers: totalUsers,
        todaySubmissions: parseInt(stats.today) || 0,
        validationQueue: pendingSubmissions.length,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics', details: error.message },
      { status: 500 }
    );
  }
}
