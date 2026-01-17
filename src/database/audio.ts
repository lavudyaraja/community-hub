import pool from './connection';

export interface AudioFile {
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

// Create an audio file record
export async function createAudioFile(data: {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data: string;
  duration?: number;
  mime_type?: string;
}): Promise<AudioFile> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO audio_files (id, submission_id, user_email, file_name, file_size, preview_data, duration, mime_type)
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
    console.error('Database error in createAudioFile:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all audio files for a user
export async function getUserAudioFiles(userEmail: string): Promise<AudioFile[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM audio_files
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get audio file by submission ID
export async function getAudioFileBySubmissionId(submissionId: string): Promise<AudioFile | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM audio_files WHERE submission_id = $1';
    const result = await client.query(query, [submissionId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete an audio file
export async function deleteAudioFile(id: string, userEmail: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      DELETE FROM audio_files
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [id, userEmail]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
