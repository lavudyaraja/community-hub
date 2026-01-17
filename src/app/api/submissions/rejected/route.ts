import { NextRequest, NextResponse } from 'next/server';
import { getRejectedSubmissions } from '@/database/submissions';

// GET - Get all rejected submissions
export async function GET(request: NextRequest) {
  try {
    const submissions = await getRejectedSubmissions();
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Error fetching rejected submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rejected submissions', details: error.message },
      { status: 500 }
    );
  }
}
