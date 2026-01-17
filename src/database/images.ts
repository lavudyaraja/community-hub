import pool from './connection';

export interface Image {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data: string;
  width?: number;
  height?: number;
  mime_type?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Create an image record
export async function createImage(data: {
  id: string;
  submission_id: string;
  user_email: string;
  file_name: string;
  file_size: number;
  preview_data: string;
  width?: number;
  height?: number;
  mime_type?: string;
}): Promise<Image> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO images (id, submission_id, user_email, file_name, file_size, preview_data, width, height, mime_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.id,
      data.submission_id,
      data.user_email,
      data.file_name,
      data.file_size,
      data.preview_data,
      data.width || null,
      data.height || null,
      data.mime_type || null
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    console.error('Database error in createImage:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all images for a user
export async function getUserImages(userEmail: string): Promise<Image[]> {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM images
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    const result = await client.query(query, [userEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get image by submission ID
export async function getImageBySubmissionId(submissionId: string): Promise<Image | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM images WHERE submission_id = $1';
    const result = await client.query(query, [submissionId]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete an image
export async function deleteImage(id: string, userEmail: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      DELETE FROM images
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [id, userEmail]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
