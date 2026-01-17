import { NextRequest, NextResponse } from 'next/server';
import { updateSubmissionStatus } from '@/database/submissions';
import { logAdminAction } from '@/database/admins';
import { getAdminByEmail } from '@/database/admins';
import { createSubmissionStatusNotification } from '@/database/notifications';

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

    // Get admin email and rejection details from request body
    const body = await request.json().catch(() => ({}));
    const adminEmail = request.headers.get('x-admin-email') || body.adminEmail;
    const rejectionReason = body.rejectionReason || null;
    const rejectionFeedback = body.rejectionFeedback || null;

    // Update submission status with rejection reason and feedback
    const submission = await updateSubmissionStatus(id, 'rejected', rejectionReason, rejectionFeedback);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Log admin action if admin email is provided
    if (adminEmail) {
      try {
        const admin = await getAdminByEmail(adminEmail);
        if (admin) {
          const ipAddress = request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown';
          const userAgent = request.headers.get('user-agent') || 'unknown';
          
          await logAdminAction({
            admin_id: admin.id,
            action_type: 'reject_submission',
            target_type: 'submission',
            target_id: id,
            description: `Rejected submission: ${submission.file_name}${rejectionReason ? ` (Reason: ${rejectionReason})` : ''}`,
            ip_address: ipAddress,
            user_agent: userAgent
          });
        }
      } catch (logError: any) {
        // Don't fail the rejection if logging fails
        console.warn('Failed to log admin action:', logError.message);
      }
    }

    // Create notification for user
    try {
      await createSubmissionStatusNotification(
        submission.user_email,
        submission.id,
        submission.file_name,
        'rejected',
        rejectionReason || undefined
      );
    } catch (notifError: any) {
      // Don't fail the rejection if notification creation fails
      console.warn('Failed to create notification:', notifError.message);
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
