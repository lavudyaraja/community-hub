import pool from './connection';
import { PoolClient } from 'pg';

export interface Submission {
  id: string;
  user_email: string;
  file_name: string;
  file_type: 'image' | 'audio' | 'video' | 'document';
  file_size: number;
  status: string;
  preview?: string;
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
      data.status || 'pending', // Default to 'pending' for admin validation
      data.preview || null
    ];
    
    const result = await client.query(query, values);
    const submission = result.rows[0];
    
    // Also create record in specific table based on file type
    if (data.preview) {
      try {
        if (fileType === 'image') {
          const { createImage } = await import('./images');
          await createImage({
            id: `img_${data.id}`,
            submission_id: data.id,
            user_email: userEmail,
            file_name: fileName,
            file_size: fileSize,
            preview_data: data.preview,
            mime_type: data.preview.split(';')[0].split(':')[1] || undefined
          });
        } else if (fileType === 'video') {
          const { createVideo } = await import('./videos');
          await createVideo({
            id: `vid_${data.id}`,
            submission_id: data.id,
            user_email: userEmail,
            file_name: fileName,
            file_size: fileSize,
            preview_data: data.preview,
            mime_type: data.preview.split(';')[0].split(':')[1] || undefined
          });
        } else if (fileType === 'audio') {
          const { createAudioFile } = await import('./audio');
          await createAudioFile({
            id: `aud_${data.id}`,
            submission_id: data.id,
            user_email: userEmail,
            file_name: fileName,
            file_size: fileSize,
            preview_data: data.preview,
            mime_type: data.preview.split(';')[0].split(':')[1] || undefined
          });
        } else if (fileType === 'document') {
          const { createWebData } = await import('./web-data');
          const fileExtension = fileName.split('.').pop() || undefined;
          await createWebData({
            id: `web_${data.id}`,
            submission_id: data.id,
            user_email: userEmail,
            file_name: fileName,
            file_size: fileSize,
            preview_data: data.preview.length < 2000000 ? data.preview : undefined,
            file_extension: fileExtension,
            mime_type: data.preview.split(';')[0].split(':')[1] || undefined
          });
        }
      } catch (typeError: any) {
        // Log but don't fail - submission is already created
        console.warn(`Failed to create ${fileType} record:`, typeError.message);
      }
    }
    
    return submission;
  } catch (error: any) {
    console.error('Database error in createSubmission:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all submissions for a user
export async function getUserSubmissions(userEmail: string): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    // Disable statement timeout for this query
    await client.query('SET statement_timeout = 0');
    
    const query = `
      SELECT * FROM submissions
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows;
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
    // First, verify the submission exists and belongs to the user
    const checkQuery = `
      SELECT id, file_type FROM submissions
      WHERE id = $1 AND user_email = $2
    `;
    const checkResult = await client.query(checkQuery, [id, userEmail]);
    
    if (checkResult.rows.length === 0) {
      return false;
    }
    
    const submission = checkResult.rows[0];
    const fileType = submission.file_type;
    
    // Delete from related tables first (due to foreign key constraints)
    // The CASCADE should handle this, but we'll do it explicitly for safety
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
      // Log but continue - related records might not exist
      console.warn(`Warning: Could not delete from ${fileType} table:`, typeError.message);
    }
    
    // Delete the submission (CASCADE will also delete related records)
    const deleteQuery = `
      DELETE FROM submissions
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(deleteQuery, [id, userEmail]);
    
    return result.rows.length > 0;
  } catch (error: any) {
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
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE file_type = 'image') as images,
        COUNT(*) FILTER (WHERE file_type = 'video') as videos,
        COUNT(*) FILTER (WHERE file_type = 'audio') as audios,
        COUNT(*) FILTER (WHERE file_type = 'document') as documents
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
export async function getPendingSubmissions(): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM submissions
      WHERE status = 'pending' OR status = 'processing' OR status = 'submitted'
      ORDER BY created_at ASC
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Update submission status (for admin validation/rejection)
export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'submitted' | 'processing' | 'validated' | 'rejected' | 'successful' | 'failed'
): Promise<Submission | null> {
  const client = await getDbClient();
  
  try {
    const query = `
      UPDATE submissions
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await client.query(query, [status, id]);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('Error updating submission status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all validated submissions
export async function getValidatedSubmissions(): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM submissions
      WHERE status = 'validated' OR status = 'successful'
      ORDER BY created_at DESC
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get all rejected submissions
export async function getRejectedSubmissions(): Promise<Submission[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM submissions
      WHERE status = 'rejected' OR status = 'failed'
      ORDER BY created_at DESC
    `;
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}
