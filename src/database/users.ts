import pool from './connection';

export interface User {
  id: number;
  email: string;
  name?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

// Create a new user
export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
}): Promise<User> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO users (email, name, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [data.email, data.name || null, data.password || null];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get all users (for admin)
export async function getAllUsers(): Promise<User[]> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}