import { NextRequest, NextResponse } from 'next/server';
import { getPendingSubmissions } from '@/database/submissions';

// GET - Get all pending submissions for admin validation
export async function GET(request: NextRequest) {
  try {
    const submissions = await getPendingSubmissions();
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Error fetching pending submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending submissions', details: error.message },
      { status: 500 }
    );
  }
}
