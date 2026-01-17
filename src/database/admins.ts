import pool from './connection';

export interface Admin {
  id: number;
  email: string;
  name: string;
  password: string;
  admin_role: 'super_admin' | 'validator_admin';
  country?: string;
  account_status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: number;
  admin_id: number;
  action_type: string;
  target_type?: string;
  target_id?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Create a new admin
export async function createAdmin(data: {
  email: string;
  name: string;
  password: string;
  admin_role: 'super_admin' | 'validator_admin';
  country?: string;
  account_status?: 'active' | 'pending' | 'suspended';
}): Promise<Admin> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO admins (email, name, password, admin_role, country, account_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        admin_role = EXCLUDED.admin_role,
        country = EXCLUDED.country,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [
      data.email,
      data.name,
      data.password,
      data.admin_role,
      data.country || null,
      data.account_status || 'pending'
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get admin by email
export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM admins WHERE email = $1';
    const result = await client.query(query, [email]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get admin by ID
export async function getAdminById(id: number): Promise<Admin | null> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM admins WHERE id = $1';
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Get all admins
export async function getAllAdmins(): Promise<Admin[]> {
  const client = await pool.connect();
  try {
    const query = 'SELECT * FROM admins ORDER BY created_at DESC';
    const result = await client.query(query);
    return result.rows;
  } finally {
    client.release();
  }
}

// Update admin
export async function updateAdmin(
  id: number,
  data: {
    name?: string;
    admin_role?: 'super_admin' | 'validator_admin';
    country?: string;
    account_status?: 'active' | 'pending' | 'suspended';
    password?: string;
  }
): Promise<Admin | null> {
  const client = await pool.connect();
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.admin_role !== undefined) {
      updates.push(`admin_role = $${paramCount++}`);
      values.push(data.admin_role);
    }
    if (data.country !== undefined) {
      updates.push(`country = $${paramCount++}`);
      values.push(data.country);
    }
    if (data.account_status !== undefined) {
      updates.push(`account_status = $${paramCount++}`);
      values.push(data.account_status);
    }
    if (data.password !== undefined) {
      updates.push(`password = $${paramCount++}`);
      values.push(data.password);
    }

    if (updates.length === 0) {
      return await getAdminById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE admins
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await client.query(query, values);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Delete admin (soft delete by setting status to suspended)
export async function deleteAdmin(id: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE admins
      SET account_status = 'suspended', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    const result = await client.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

// Log admin action
export async function logAdminAction(data: {
  admin_id: number;
  action_type: string;
  target_type?: string;
  target_id?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<AdminAction> {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, description, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.admin_id,
      data.action_type,
      data.target_type || null,
      data.target_id || null,
      data.description || null,
      data.ip_address || null,
      data.user_agent || null
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

// Get admin actions
export async function getAdminActions(adminId?: number, limit: number = 100): Promise<AdminAction[]> {
  const client = await pool.connect();
  try {
    let query = 'SELECT * FROM admin_actions';
    const values: any[] = [];

    if (adminId) {
      query += ' WHERE admin_id = $1';
      values.push(adminId);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1);
    values.push(limit);

    const result = await client.query(query, values);
    return result.rows;
  } finally {
    client.release();
  }
}

// Authenticate admin (check email and password)
export async function authenticateAdmin(email: string, password: string): Promise<Admin | null> {
  const admin = await getAdminByEmail(email);
  if (!admin) {
    return null;
  }
  
  // In production, use proper password hashing (bcrypt, etc.)
  if (admin.password === password && admin.account_status === 'active') {
    return admin;
  }
  
  return null;
}
