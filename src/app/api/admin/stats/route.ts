import { NextRequest, NextResponse } from 'next/server';
import pool from '@/database/connection';
import { PoolClient } from 'pg';

// Helper function to get a database client (optimized - no retries for speed)
async function getDbClient(): Promise<PoolClient> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error: any) {
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

// GET - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const client = await getDbClient();
    
    try {
      // Single optimized query to get all stats at once (much faster)
      const statsQuery = await client.query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status IN ('pending', 'processing'))::int as pending,
          COUNT(*) FILTER (WHERE status IN ('validated', 'successful'))::int as validated,
          COUNT(*) FILTER (WHERE status IN ('rejected', 'failed'))::int as rejected,
          COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int as today
        FROM submissions
      `);
      
      const stats = statsQuery.rows[0];
      
      // Run remaining queries in parallel (only essential ones)
      const [
        usersResult,
        recentSubmissionsResult
      ] = await Promise.all([
        // Get total users count
        client.query('SELECT COUNT(*)::int as total FROM users'),
        // Get recent submissions (last 10) - simplified
        client.query(`
          SELECT id, file_name, file_type, file_size, user_email, status, created_at
          FROM submissions
          ORDER BY created_at DESC
          LIMIT 10
        `)
      ]);
      
      // Get file type stats and weekly trend in parallel (non-blocking)
      const [fileTypeStatsResult, weeklyTrendResult] = await Promise.all([
        client.query(`
          SELECT file_type, COUNT(*)::int as count
          FROM submissions
          GROUP BY file_type
        `),
        client.query(`
          SELECT created_at::date as date, COUNT(*)::int as count
          FROM submissions
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY created_at::date
          ORDER BY date ASC
        `)
      ]);
      
      // Values are already integers from the query (using ::int cast)
      const totalSubs = stats?.total || 0;
      const pendingSubs = stats?.pending || 0;
      const validatedSubs = stats?.validated || 0;
      const rejectedSubs = stats?.rejected || 0;
      const todaySubs = stats?.today || 0;
      const totalUsers = usersResult.rows[0]?.total || 0;
      const validationQueueCount = pendingSubs; // Same as pending
      
      return NextResponse.json({
        totalSubmissions: totalSubs,
        pendingSubmissions: pendingSubs,
        validatedSubmissions: validatedSubs,
        rejectedSubmissions: rejectedSubs,
        totalVolunteers: totalUsers || 0,
        todaySubmissions: todaySubs,
        validationQueue: validationQueueCount,
        recentSubmissions: (recentSubmissionsResult?.rows || []).map(row => ({
          id: row.id,
          fileName: row.file_name,
          fileType: row.file_type,
          fileSize: Number(row.file_size) || 0,
          userEmail: row.user_email,
          status: row.status,
          createdAt: row.created_at
        })),
        fileTypeStats: (fileTypeStatsResult?.rows || []).map(row => ({
          type: row.file_type,
          count: Number(row.count) || 0
        })),
        weeklyTrend: (weeklyTrendResult?.rows || []).map(row => ({
          date: row.date,
          count: Number(row.count) || 0
        }))
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
