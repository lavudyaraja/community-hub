// Verify admin database tables and show current data
// Usage: npx tsx scripts/verify-admin-db.ts

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_FKfar7I6QGle@ep-hidden-cloud-ahkj741s-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verifyAdminDB() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying admin database...\n');
    
    // Check if admins table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Admins table does not exist!');
      return;
    }
    
    console.log('✅ Admins table exists');
    
    // Check admin_actions table
    const actionsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_actions'
      )
    `);
    
    if (!actionsTableCheck.rows[0].exists) {
      console.log('❌ Admin_actions table does not exist!');
      return;
    }
    
    console.log('✅ Admin_actions table exists\n');
    
    // Get admin count
    const adminCount = await client.query('SELECT COUNT(*) as count FROM admins');
    console.log(`📊 Total admins in database: ${adminCount.rows[0].count}`);
    
    // Get all admins (without password)
    const admins = await client.query(`
      SELECT id, email, name, admin_role, country, account_status, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `);
    
    if (admins.rows.length > 0) {
      console.log('\n👥 Current admins:');
      admins.rows.forEach((admin, index) => {
        console.log(`\n   [${index + 1}] ${admin.name} (${admin.email})`);
        console.log(`       Role: ${admin.admin_role}`);
        console.log(`       Status: ${admin.account_status}`);
        console.log(`       Country: ${admin.country || 'N/A'}`);
        console.log(`       Created: ${new Date(admin.created_at).toLocaleString()}`);
      });
    } else {
      console.log('\n⚠️  No admins found in database');
      console.log('   You can create an admin by registering at /auth/admin-auth/register');
    }
    
    // Get admin actions count
    const actionsCount = await client.query('SELECT COUNT(*) as count FROM admin_actions');
    console.log(`\n📝 Total admin actions logged: ${actionsCount.rows[0].count}`);
    
    console.log('\n✅ Admin database verification complete!');
    
  } catch (error: any) {
    console.error('❌ Error verifying admin database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyAdminDB();
