import { NextRequest, NextResponse } from 'next/server';
import { getValidatedSubmissions } from '@/database/submissions';

// GET - Get all validated submissions
export async function GET(request: NextRequest) {
  try {
    const submissions = await getValidatedSubmissions();
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Error fetching validated submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validated submissions', details: error.message },
      { status: 500 }
    );
  }
}
