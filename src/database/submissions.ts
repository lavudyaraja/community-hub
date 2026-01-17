import pool from './connection';
import { PoolClient } from 'pg';

export interface Submission {
  id: string;
  user_email: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  status: 'pending' | 'submitted' | 'processing' | 'validated' | 'rejected' | 'successful' | 'failed';
  preview?: string;
  rejection_reason?: string;
  rejection_feedback?: string;
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
      // Set statement timeout to 30 seconds to prevent long-running queries
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

// Create a new submission
export async function createSubmission(data: {
  id: string;
  user_email?: string;
  userEmail?: string;
  file_name?: string;
  fileName?: string;
  file_type?: string;
  fileType?: string;
  file_size?: number;
  fileSize?: number;
  status?: string;
  preview?: string;
}): Promise<Submission> {
  // Support both snake_case and camelCase
  const userEmail = data.user_email || data.userEmail || '';
  const fileName = data.file_name || data.fileName || '';
  const fileType = (data.file_type || data.fileType || 'document') as 'image' | 'audio' | 'video' | 'document';
  const fileSize = data.file_size || data.fileSize || 0;
  
  const client = await getDbClient();
  
  try {
    await client.query('BEGIN');
    
    // First, ensure user exists (create if not exists)
    await client.query(`
      INSERT INTO users (email)
      VALUES ($1)
      ON CONFLICT (email) DO NOTHING
    `, [userEmail]);
    
    const query = `
      INSERT INTO submissions (id, user_email, file_name, file_type, file_size, status, preview)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.id,
      userEmail,
      fileName,
      fileType,
      fileSize,
      data.status || 'pending',
      data.preview || null
    ];
    
    const result = await client.query(query, values);
    const submission = result.rows[0];
    
    // Also create record in specific table based on file type
    // Use the same client/transaction to avoid foreign key constraint violations
    if (data.preview) {
      try {
        const mimeType = data.preview.split(';')[0].split(':')[1] || undefined;
        
        if (fileType === 'image') {
          const imageQuery = `
            INSERT INTO images (id, submission_id, user_email, file_name, file_size, preview_data, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;
          await client.query(imageQuery, [
            `img_${data.id}`,
            data.id,
            userEmail,
            fileName,
            fileSize,
            data.preview,
            mimeType
          ]);
        } else if (fileType === 'video') {
          const videoQuery = `
            INSERT INTO videos (id, submission_id, user_email, file_name, file_size, preview_data, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;
          await client.query(videoQuery, [
            `vid_${data.id}`,
            data.id,
            userEmail,
            fileName,
            fileSize,
            data.preview,
            mimeType
          ]);
        } else if (fileType === 'audio') {
          const audioQuery = `
            INSERT INTO audio_files (id, submission_id, user_email, file_name, file_size, preview_data, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
          `;
          await client.query(audioQuery, [
            `aud_${data.id}`,
            data.id,
            userEmail,
            fileName,
            fileSize,
            data.preview,
            mimeType
          ]);
        } else if (fileType === 'document') {
          const fileExtension = fileName.split('.').pop() || undefined;
          const webDataQuery = `
            INSERT INTO web_data (id, submission_id, user_email, file_name, file_size, preview_data, file_extension, mime_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          await client.query(webDataQuery, [
            `web_${data.id}`,
            data.id,
            userEmail,
            fileName,
            fileSize,
            data.preview.length < 2000000 ? data.preview : null,
            fileExtension,
            mimeType
          ]);
        }
      } catch (typeError: any) {
        console.warn(`Failed to create ${fileType} record:`, typeError.message);
        // Don't throw - submission is primary record, but log the error
        console.error(`Error details:`, typeError);
      }
    }
    
    await client.query('COMMIT');
    return submission;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Database error in createSubmission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all submissions for a user
export async function getUserSubmissions(userEmail: string, limit: number = 1000): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    // First try to get columns including rejection fields (if migration has been run)
    // If columns don't exist, fall back to basic query
    let query = `
      SELECT id, user_email, file_name, file_type, file_size, status, rejection_reason, rejection_feedback, created_at, updated_at
      FROM submissions
      WHERE user_email = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    try {
      const result = await client.query(query, [userEmail, limit]);
      return result.rows;
    } catch (error: any) {
      // If columns don't exist yet, use fallback query without rejection fields
      if (error.message && error.message.includes('rejection_reason') || error.message.includes('rejection_feedback')) {
        console.warn('Rejection columns not found, using fallback query. Please run migration: scripts/add-rejection-fields.sql');
        query = `
          SELECT id, user_email, file_name, file_type, file_size, status, created_at, updated_at
          FROM submissions
          WHERE user_email = $1
          ORDER BY created_at DESC
          LIMIT $2
        `;
        const result = await client.query(query, [userEmail, limit]);
        // Add null rejection fields to match interface
        return result.rows.map((row: any) => ({
          ...row,
          rejection_reason: null,
          rejection_feedback: null
        }));
      }
      throw error;
    }
  } finally {
    client.release();
  }
}

// Get submission by ID
export async function getSubmissionById(id: string): Promise<Submission | null> {
  const client = await getDbClient();
  
  try {
    const query = 'SELECT * FROM submissions WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete a submission
export async function deleteSubmission(id: string, userEmail: string): Promise<boolean> {
  const client = await getDbClient();
  
  try {
    await client.query('BEGIN');
    
    // First, verify the submission exists and belongs to the user
    const checkQuery = `
      SELECT id, file_type FROM submissions
      WHERE id = $1 AND user_email = $2
    `;
    const checkResult = await client.query(checkQuery, [id, userEmail]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }
    
    const submission = checkResult.rows[0];
    const fileType = submission.file_type;
    
    // Delete from related tables first (CASCADE should handle this, but explicit is safer)
    try {
      if (fileType === 'image') {
        await client.query('DELETE FROM images WHERE submission_id = $1', [id]);
      } else if (fileType === 'video') {
        await client.query('DELETE FROM videos WHERE submission_id = $1', [id]);
      } else if (fileType === 'audio') {
        await client.query('DELETE FROM audio_files WHERE submission_id = $1', [id]);
      } else if (fileType === 'document') {
        await client.query('DELETE FROM web_data WHERE submission_id = $1', [id]);
      }
    } catch (typeError: any) {
      console.warn(`Warning: Could not delete from ${fileType} table:`, typeError.message);
    }
    
    // Delete the submission
    const deleteQuery = `
      DELETE FROM submissions
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(deleteQuery, [id, userEmail]);
    
    await client.query('COMMIT');
    return result.rows.length > 0;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error deleting submission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get submissions by file type
export async function getSubmissionsByType(
  userEmail: string,
  fileType: 'image' | 'audio' | 'video' | 'document'
): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM submissions
      WHERE user_email = $1 AND file_type = $2
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail, fileType]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get submission statistics for a user
export async function getUserSubmissionStats(userEmail: string) {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT 
        COUNT(*)::integer as total,
        COUNT(*) FILTER (WHERE file_type = 'image')::integer as images,
        COUNT(*) FILTER (WHERE file_type = 'video')::integer as videos,
        COUNT(*) FILTER (WHERE file_type = 'audio')::integer as audios,
        COUNT(*) FILTER (WHERE file_type = 'document')::integer as documents
      FROM submissions
      WHERE user_email = $1
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get all pending submissions for admin validation
export async function getPendingSubmissions(limit: number = 1000): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    // Exclude preview column to avoid loading large data and improve performance
    const query = `
      SELECT id, user_email, file_name, file_type, file_size, status, created_at, updated_at
      FROM submissions
      WHERE status IN ('pending', 'processing', 'submitted')
      ORDER BY created_at ASC
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Update submission status (for admin validation/rejection)
export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'submitted' | 'processing' | 'validated' | 'rejected' | 'successful' | 'failed',
  rejectionReason?: string,
  rejectionFeedback?: string
): Promise<Submission | null> {
  const client = await getDbClient();
  
  try {
    // If rejecting, include rejection reason and feedback
    if (status === 'rejected') {
      let query = `
        UPDATE submissions
        SET status = $1, 
            rejection_reason = $2,
            rejection_feedback = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      
      try {
        const result = await client.query(query, [status, rejectionReason || null, rejectionFeedback || null, id]);
        return result.rows[0] || null;
      } catch (error: any) {
        // If columns don't exist, use fallback query without rejection fields
        if (error.message && (error.message.includes('rejection_reason') || error.message.includes('rejection_feedback'))) {
          console.warn('Rejection columns not found, using fallback query. Please run migration: scripts/add-rejection-fields.sql');
          query = `
            UPDATE submissions
            SET status = $1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
          `;
          const result = await client.query(query, [status, id]);
          const submission = result.rows[0] || null;
          // Add rejection fields to result if submission exists
          if (submission) {
            return {
              ...submission,
              rejection_reason: rejectionReason || null,
              rejection_feedback: rejectionFeedback || null
            };
          }
          return null;
        }
        throw error;
      }
    } else {
      // For other statuses, try to clear rejection fields if they exist
      let query = `
        UPDATE submissions
        SET status = $1, 
            rejection_reason = NULL,
            rejection_feedback = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      try {
        const result = await client.query(query, [status, id]);
        return result.rows[0] || null;
      } catch (error: any) {
        // If columns don't exist, use fallback query without clearing rejection fields
        if (error.message && (error.message.includes('rejection_reason') || error.message.includes('rejection_feedback'))) {
          query = `
            UPDATE submissions
            SET status = $1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
          `;
          const result = await client.query(query, [status, id]);
          return result.rows[0] || null;
        }
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Error updating submission status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all validated submissions
export async function getValidatedSubmissions(limit: number = 1000): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    // Exclude preview column to avoid loading large data and improve performance
    const query = `
      SELECT id, user_email, file_name, file_type, file_size, status, created_at, updated_at
      FROM submissions
      WHERE status IN ('validated', 'successful')
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get all rejected submissions
export async function getRejectedSubmissions(limit: number = 1000): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    // Exclude preview column to avoid loading large data and improve performance
    const query = `
      SELECT id, user_email, file_name, file_type, file_size, status, created_at, updated_at
      FROM submissions
      WHERE status IN ('rejected', 'failed')
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const result = await client.query(query, [limit]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get submission with related type-specific data
export async function getSubmissionWithDetails(id: string): Promise<Submission & { typeData?: any } | null> {
  const client = await getDbClient();
  
  try {
    const submission = await getSubmissionById(id);
    if (!submission) return null;
    
    let typeData;
    if (submission.file_type === 'image') {
      const result = await client.query('SELECT * FROM images WHERE submission_id = $1', [id]);
      typeData = result.rows[0];
    } else if (submission.file_type === 'video') {
      const result = await client.query('SELECT * FROM videos WHERE submission_id = $1', [id]);
      typeData = result.rows[0];
    } else if (submission.file_type === 'audio') {
      const result = await client.query('SELECT * FROM audio_files WHERE submission_id = $1', [id]);
      typeData = result.rows[0];
    } else if (submission.file_type === 'document') {
      const result = await client.query('SELECT * FROM web_data WHERE submission_id = $1', [id]);
      typeData = result.rows[0];
    }
    
    return { ...submission, typeData };
  } finally {
    client.release();
  }
}