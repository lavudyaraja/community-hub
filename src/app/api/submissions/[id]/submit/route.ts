import { NextRequest, NextResponse } from 'next/server';
import { updateSubmissionStatus, getSubmissionById, createSubmission } from '@/database/submissions';

// POST - Submit a submission for validation (user action)
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

    // Get submission data from request body if submission doesn't exist in DB
    let requestBody = null;
    try {
      requestBody = await request.json().catch(() => null);
    } catch {
      // Request body is optional
    }

    // Check if submission exists in database
    let existingSubmission = await getSubmissionById(id);
    
    // If submission doesn't exist and we have data from request, create it
    if (!existingSubmission && requestBody) {
      try {
        existingSubmission = await createSubmission({
          id: requestBody.id || id,
          userEmail: requestBody.userEmail || requestBody.user_email,
          fileName: requestBody.fileName || requestBody.file_name,
          fileType: requestBody.fileType || requestBody.file_type,
          fileSize: requestBody.fileSize || requestBody.file_size,
          status: 'submitted', // Set to submitted when user submits
          preview: requestBody.preview,
        });
      } catch (createError: any) {
        console.error('Error creating submission:', createError);
        // Continue to try updating if creation fails
      }
    }

    // If still no submission found, return error
    if (!existingSubmission) {
      return NextResponse.json(
        { 
          error: 'Submission not found',
          message: 'Please ensure the submission exists in the database. You may need to upload it first.'
        },
        { status: 404 }
      );
    }

    // Update status to 'submitted' when user submits for validation
    const submission = await updateSubmissionStatus(id, 'submitted');
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Failed to update submission status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully submitted for validation',
      submission 
    });
  } catch (error: any) {
    console.error('Error submitting for validation:', error);
    return NextResponse.json(
      { error: 'Failed to submit for validation', details: error.message },
      { status: 500 }
    );
  }
}
