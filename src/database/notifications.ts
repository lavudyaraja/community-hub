import pool from './connection';
import { PoolClient } from 'pg';

export interface Notification {
  id: string;
  user_email: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  action_url?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to ensure notifications table exists
let tableChecked = false;
async function ensureNotificationsTable() {
  if (tableChecked) return;
  
  const client = await pool.connect();
  try {
    // Check if table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `);
    
    if (!checkResult.rows[0].exists) {
      console.log('Creating notifications table...');
      
      // Create table
      await client.query(`
        CREATE TABLE notifications (
          id VARCHAR(255) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('success', 'error', 'info', 'warning')),
          title VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          read BOOLEAN DEFAULT false,
          action_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_email ON notifications(user_email);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_email, read);
      `);
      
      // Create trigger function if it doesn't exist
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);
      
      // Create trigger
      await client.query(`
        DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
        CREATE TRIGGER update_notifications_updated_at
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
      `);
      
      console.log('✅ Notifications table created successfully');
    }
    
    tableChecked = true;
  } catch (error: any) {
    // If table already exists, that's fine
    if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
      console.error('Error ensuring notifications table:', error);
    }
    tableChecked = true;
  } finally {
    client.release();
  }
}

// Helper function to get a database client with retry logic
async function getDbClient(): Promise<PoolClient> {
  // Ensure table exists before operations
  await ensureNotificationsTable();
  
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

// Create a new notification
export async function createNotification(data: {
  user_email: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  action_url?: string;
}): Promise<Notification> {
  const client = await getDbClient();
  
  try {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const query = `
      INSERT INTO notifications (id, user_email, type, title, message, action_url, read)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *
    `;
    
    const values = [
      id,
      data.user_email,
      data.type,
      data.title,
      data.message,
      data.action_url || null
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get all notifications for a user
export async function getUserNotifications(userEmail: string): Promise<Notification[]> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT * FROM notifications
      WHERE user_email = $1
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query, [userEmail]);
    return result.rows;
  } finally {
    client.release();
  }
}

// Get unread notification count for a user
export async function getUnreadNotificationCount(userEmail: string): Promise<number> {
  const client = await getDbClient();
  
  try {
    const query = `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_email = $1 AND read = false
    `;
    
    const result = await client.query(query, [userEmail]);
    return parseInt(result.rows[0].count, 10);
  } finally {
    client.release();
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, userEmail: string): Promise<Notification> {
  const client = await getDbClient();
  
  try {
    const query = `
      UPDATE notifications
      SET read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_email = $2
      RETURNING *
    `;
    
    const result = await client.query(query, [notificationId, userEmail]);
    
    if (result.rows.length === 0) {
      throw new Error('Notification not found or access denied');
    }
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userEmail: string): Promise<number> {
  const client = await getDbClient();
  
  try {
    const query = `
      UPDATE notifications
      SET read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_email = $1 AND read = false
      RETURNING id
    `;
    
    const result = await client.query(query, [userEmail]);
    return result.rows.length;
  } finally {
    client.release();
  }
}

// Delete a notification
export async function deleteNotification(notificationId: string, userEmail: string): Promise<boolean> {
  const client = await getDbClient();
  
  try {
    const query = `
      DELETE FROM notifications
      WHERE id = $1 AND user_email = $2
      RETURNING id
    `;
    
    const result = await client.query(query, [notificationId, userEmail]);
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

// Delete all notifications for a user
export async function deleteAllNotifications(userEmail: string): Promise<number> {
  const client = await getDbClient();
  
  try {
    const query = `
      DELETE FROM notifications
      WHERE user_email = $1
      RETURNING id
    `;
    
    const result = await client.query(query, [userEmail]);
    return result.rows.length;
  } finally {
    client.release();
  }
}

// Create notification when submission status changes
export async function createSubmissionStatusNotification(
  userEmail: string,
  submissionId: string,
  fileName: string,
  status: string,
  rejectionReason?: string
): Promise<Notification> {
  let type: 'success' | 'error' | 'info' | 'warning' = 'info';
  let title = '';
  let message = '';
  let actionUrl = `/dashboard/submissions`;

  switch (status) {
    case 'validated':
    case 'successful':
      type = 'success';
      title = 'Submission Validated';
      message = `Your submission "${fileName}" has been successfully validated and approved.`;
      break;
    case 'rejected':
    case 'failed':
      type = 'error';
      title = 'Submission Rejected';
      message = rejectionReason 
        ? `Your submission "${fileName}" was rejected: ${rejectionReason}`
        : `Your submission "${fileName}" was rejected. Please review and resubmit.`;
      break;
    case 'pending':
      type = 'warning';
      title = 'Validation Pending';
      message = `Your submission "${fileName}" is pending validation. Please check back later.`;
      break;
    default:
      type = 'info';
      title = 'Submission Updated';
      message = `Your submission "${fileName}" status has been updated to ${status}.`;
  }

  return createNotification({
    user_email: userEmail,
    type,
    title,
    message,
    action_url: actionUrl
  });
}
