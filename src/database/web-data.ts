import pool from './connection';

export interface WebData {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data?: string;
  file_extension?: string;
  mime_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Create a web data record
export async function createWebData(data: {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data?: string;
  file_extension?: string;
  mime_type?: string;
}): Promise<WebData> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO web_data (id, submission_id, user_email, file_name, file_size, preview_data, file_extension, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.id,
      data.submission_id,
      data.user_email,
      data.file_name,
      data.file_size,
      data.preview_data || null,
      data.file_extension || null,
      data.mime_type || null
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    console.error('Database error in createWebData:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all web data for a user
export async function getUserWebData(userEmail: string): Promise<WebData[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM web_data
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get web data by submission ID
export async function getWebDataBySubmissionId(submissionId: string): Promise<WebData | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM web_data WHERE submission_id = $1';
    const result = await client.query(query, [submissionId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete web data
export async function deleteWebData(id: string, userEmail: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      DELETE FROM web_data
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [id, userEmail]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
