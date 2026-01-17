import pool from './connection';
import { PoolClient } from 'pg';

export interface SubmissionComment {
  id: number;
  submission_id: string;
  author_email: string;
  author_type: 'user' | 'admin';
  comment_text: string;
  parent_comment_id?: number | null;
  created_at: string;
  updated_at: string;
}

// Helper function to get a database client with retry logic
async function getDbClient(): Promise<PoolClient> {
  let retries = 3;
  let lastError: Error | undefined;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      await client.query('SET statement_timeout = 30000');
      return client;
    } catch (error: any) {
      lastError = error;
      retries--;
      if (retries > 0) {
        console.warn(`Connection attempt failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  throw new Error(`Failed to connect to database after retries: ${lastError?.message || 'Unknown error'}`);
}

// Create a new comment
export async function createComment(data: {
  submission_id: string;
  author_email: string;
  author_type: 'user' | 'admin';
  comment_text: string;
  parent_comment_id?: number | null;
}): Promise<SubmissionComment> {
  const client = await getDbClient();
  
  try {
    const query = `
      INSERT INTO submission_comments (submission_id, author_email, author_type, comment_text, parent_comment_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await client.query(query, [
      data.submission_id,
      data.author_email,
      data.author_type,
      data.comment_text,
      data.parent_comment_id || null
    ]);
    return result.rows[0];
  } catch (error: any) {
    // If table doesn't exist, provide helpful error message
    if (error.message && error.message.includes('submission_comments')) {
      console.error('submission_comments table not found. Please run migration: scripts/add-submission-comments.sql');
      throw new Error('Comments feature not available. Please run database migration first.');
    }
    console.error('Error creating comment:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all comments for a submission (with threading)
export async function getSubmissionComments(submissionId: string): Promise<SubmissionComment[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT *
      FROM submission_comments
      WHERE submission_id = $1
      ORDER BY created_at ASC
    `;
    const result = await client.query(query, [submissionId]);
    return result.rows;
  } catch (error: any) {
    // If table doesn't exist yet, return empty array
    if (error.message && error.message.includes('submission_comments')) {
      console.warn('submission_comments table not found. Please run migration: scripts/add-submission-comments.sql');
      return [];
    }
    console.error('Error fetching comments:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get a single comment by ID
export async function getCommentById(commentId: number): Promise<SubmissionComment | null> {
  const client = await getDbClient();
  
  try {
    const query = 'SELECT * FROM submission_comments WHERE id = $1';
    const result = await client.query(query, [commentId]);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('Error fetching comment:', error);
    return null;
  } finally {
    client.release();
  }
}

// Update a comment
export async function updateComment(commentId: number, commentText: string, authorEmail: string): Promise<SubmissionComment | null> {
  const client = await getDbClient();
  
  try {
    // Verify the comment belongs to the author
    const checkQuery = 'SELECT * FROM submission_comments WHERE id = $1 AND author_email = $2';
    const checkResult = await client.query(checkQuery, [commentId, authorEmail]);
    
    if (checkResult.rows.length === 0) {
      return null; // Comment not found or not authorized
    }
    
    const query = `
      UPDATE submission_comments
      SET comment_text = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND author_email = $3
      RETURNING *
    `;
    const result = await client.query(query, [commentText, commentId, authorEmail]);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('Error updating comment:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Delete a comment
export async function deleteComment(commentId: number, authorEmail: string, isAdmin: boolean = false): Promise<boolean> {
  const client = await getDbClient();
  
  try {
    let query: string;
    let params: any[];
    
    if (isAdmin) {
      // Admins can delete any comment
      query = 'DELETE FROM submission_comments WHERE id = $1 RETURNING id';
      params = [commentId];
    } else {
      // Users can only delete their own comments
      query = 'DELETE FROM submission_comments WHERE id = $1 AND author_email = $2 RETURNING id';
      params = [commentId, authorEmail];
    }
    
    const result = await client.query(query, params);
    return result.rows.length > 0;
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get comment count for a submission
export async function getCommentCount(submissionId: string): Promise<number> {
  const client = await getDbClient();
  
  try {
    const query = 'SELECT COUNT(*) as count FROM submission_comments WHERE submission_id = $1';
    const result = await client.query(query, [submissionId]);
    return parseInt(result.rows[0].count) || 0;
  } catch (error: any) {
    // If table doesn't exist, return 0
    if (error.message && error.message.includes('submission_comments')) {
      return 0;
    }
    console.error('Error getting comment count:', error);
    return 0;
  } finally {
    client.release();
  }
}
