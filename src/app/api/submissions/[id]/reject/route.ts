import { NextRequest, NextResponse } from 'next/server';
import { updateSubmissionStatus } from '@/database/submissions';

// POST - Reject a submission (admin action)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const submission = await updateSubmissionStatus(id, 'rejected');
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      submission 
    });
  } catch (error: any) {
    console.error('Error rejecting submission:', error);
    return NextResponse.json(
      { error: 'Failed to reject submission', details: error.message },
      { status: 500 }
    );
  }
}
