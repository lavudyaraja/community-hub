import pool from './connection';

export interface Video {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data: string;
  duration?: number;
  mime_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Create a video record
export async function createVideo(data: {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data: string;
  duration?: number;
  mime_type?: string;
}): Promise<Video> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO videos (id, submission_id, user_email, file_name, file_size, preview_data, duration, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.id,
      data.submission_id,
      data.user_email,
      data.file_name,
      data.file_size,
      data.preview_data,
      data.duration || null,
      data.mime_type || null
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    console.error('Database error in createVideo:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all videos for a user
export async function getUserVideos(userEmail: string): Promise<Video[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM videos
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get video by submission ID
export async function getVideoBySubmissionId(submissionId: string): Promise<Video | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM videos WHERE submission_id = $1';
    const result = await client.query(query, [submissionId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete a video
export async function deleteVideo(id: string, userEmail: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      DELETE FROM videos
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [id, userEmail]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
