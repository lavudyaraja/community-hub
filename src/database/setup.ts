// Database setup script
// Run this to initialize the database schema
import { runMigrations } from './migrations';

async function setup() {
  console.log('🚀 Starting database setup...');
  try {
    await runMigrations();
    console.log('✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setup();
