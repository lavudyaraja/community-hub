import { NextResponse } from 'next/server';
import { runMigrations } from '@/database/migrations';

// API route to manually trigger migrations
export async function GET() {
  try {
    await runMigrations();
    return NextResponse.json({ success: true, message: 'Migrations completed' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
