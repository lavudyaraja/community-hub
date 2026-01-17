import { NextRequest, NextResponse } from 'next/server';
import { deleteSubmission, getSubmissionById } from '@/database/submissions';

// DELETE - Delete a submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const searchParams = request.nextUrl.searchParams;
    const userEmail = searchParams.get('userEmail');

    console.log('Deleting submission:', resolvedParams.id, 'for user:', userEmail);

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    if (!resolvedParams.id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteSubmission(resolvedParams.id, userEmail);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }

    console.log('Successfully deleted submission:', resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting submission:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to delete submission', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Get a single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const submission = await getSubmissionById(resolvedParams.id);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission', details: error.message },
      { status: 500 }
    );
  }
}
