import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not found in environment variables');
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Connection timeout for establishing connection
  // Set statement timeout to 30 seconds to prevent long-running queries
  statement_timeout: 30000,
});

// Test the connection
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Connected to Neon PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    // process.exit(-1);
  }
});

export default pool;
