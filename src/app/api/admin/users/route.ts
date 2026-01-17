import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/database/users';

// GET - Get all users (volunteers) for admin
export async function GET(request: NextRequest) {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}
