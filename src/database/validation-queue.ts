import pool from './connection';
import { PoolClient } from 'pg';

export interface ValidationQueueItem {
  id: string;
  submission_id: string;
  admin_email: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
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
      // Set statement timeout to 30 seconds
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

// Add submission to validation queue
export async function addToValidationQueue(
  submissionId: string,
  adminEmail: string
): Promise<ValidationQueueItem> {
  const client = await getDbClient();
  
  try {
    const query = `
      INSERT INTO validation_queue (submission_id, admin_email, status)
      VALUES ($1, $2, 'pending')
      ON CONFLICT (submission_id, admin_email) 
      DO UPDATE SET status = 'pending', updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await client.query(query, [submissionId, adminEmail]);
    return result.rows[0];
  } catch (error: any) {
    console.error('Error adding to validation queue:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Add multiple submissions to validation queue
export async function addBulkToValidationQueue(
  submissionIds: string[],
  adminEmail: string
): Promise<ValidationQueueItem[]> {
  const client = await getDbClient();
  
  try {
    await client.query('BEGIN');
    
    const items: ValidationQueueItem[] = [];
    
    for (const submissionId of submissionIds) {
      const query = `
        INSERT INTO validation_queue (submission_id, admin_email, status)
        VALUES ($1, $2, 'pending')
        ON CONFLICT (submission_id, admin_email) 
        DO UPDATE SET status = 'pending', updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const result = await client.query(query, [submissionId, adminEmail]);
      items.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    return items;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error adding bulk to validation queue:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get validation queue items for an admin
export async function getValidationQueue(adminEmail: string): Promise<ValidationQueueItem[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM validation_queue
      WHERE admin_email = $1 AND status IN ('pending', 'in_progress')
      ORDER BY created_at ASC
    `;
    const result = await client.query(query, [adminEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get validation queue item by submission ID
export async function getValidationQueueItem(
  submissionId: string,
  adminEmail: string
): Promise<ValidationQueueItem | null> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM validation_queue
      WHERE submission_id = $1 AND admin_email = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const result = await client.query(query, [submissionId, adminEmail]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Update validation queue item status
export async function updateValidationQueueStatus(
  submissionId: string,
  adminEmail: string,
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
): Promise<ValidationQueueItem | null> {
  const client = await getDbClient();
  
  try {
    const query = `
      UPDATE validation_queue
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE submission_id = $2 AND admin_email = $3
      RETURNING *
    `;
    const result = await client.query(query, [status, submissionId, adminEmail]);
    return result.rows[0] || null;
  } catch (error: any) {
    console.error('Error updating validation queue status:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Remove from validation queue
export async function removeFromValidationQueue(
  submissionId: string,
  adminEmail: string
): Promise<boolean> {
  const client = await getDbClient();
  
  try {
    const query = `
      UPDATE validation_queue
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE submission_id = $1 AND admin_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [submissionId, adminEmail]);
    return result.rows.length > 0;
  } catch (error: any) {
    console.error('Error removing from validation queue:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Remove multiple items from validation queue
export async function removeBulkFromValidationQueue(
  submissionIds: string[],
  adminEmail: string
): Promise<number> {
  const client = await getDbClient();
  
  try {
    await client.query('BEGIN');
    
    const query = `
      UPDATE validation_queue
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE submission_id = ANY($1::text[]) AND admin_email = $2
      RETURNING id
    `;
    const result = await client.query(query, [submissionIds, adminEmail]);
    
    await client.query('COMMIT');
    return result.rows.length;
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error removing bulk from validation queue:', error);
    throw error;
  } finally {
    client.release();
  }
}
