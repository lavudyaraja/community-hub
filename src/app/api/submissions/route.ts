import { NextRequest, NextResponse } from 'next/server';
import { createSubmission, getUserSubmissions, deleteSubmission } from '@/database/submissions';

// GET - Get all submissions for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userEmail = searchParams.get('userEmail');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    const submissions = await getUserSubmissions(userEmail);
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userEmail, fileName, fileType, fileSize, status, preview } = body;

    console.log('Creating submission with data:', { id, userEmail, fileName, fileType, fileSize });

    if (!id || !userEmail || !fileName || !fileType || fileSize === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { id, userEmail, fileName, fileType, fileSize } },
        { status: 400 }
      );
    }

    const submission = await createSubmission({
      id,
      userEmail,
      fileName,
      fileType,
      fileSize,
      status: status || 'pending', // Default to 'pending' for admin validation
      preview: preview || undefined,
    });

    console.log('Submission created successfully:', submission.id);
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    console.error('Error creating submission:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to create submission', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
