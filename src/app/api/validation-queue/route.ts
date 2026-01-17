import { NextRequest, NextResponse } from 'next/server';
import { 
  addToValidationQueue, 
  addBulkToValidationQueue,
  getValidationQueue,
  removeFromValidationQueue,
  removeBulkFromValidationQueue
} from '@/database/validation-queue';

// GET - Get validation queue for an admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adminEmail = searchParams.get('adminEmail');

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'adminEmail is required' },
        { status: 400 }
      );
    }

    const queue = await getValidationQueue(adminEmail);
    return NextResponse.json(queue);
  } catch (error: any) {
    console.error('Error fetching validation queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validation queue', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add submission(s) to validation queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, submissionIds, adminEmail } = body;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'adminEmail is required' },
        { status: 400 }
      );
    }

    if (submissionIds && Array.isArray(submissionIds)) {
      // Bulk add
      const items = await addBulkToValidationQueue(submissionIds, adminEmail);
      return NextResponse.json({ 
        success: true, 
        items,
        count: items.length 
      });
    } else if (submissionId) {
      // Single add
      const item = await addToValidationQueue(submissionId, adminEmail);
      return NextResponse.json({ 
        success: true, 
        item 
      });
    } else {
      return NextResponse.json(
        { error: 'submissionId or submissionIds is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error adding to validation queue:', error);
    return NextResponse.json(
      { error: 'Failed to add to validation queue', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove submission(s) from validation queue
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get('submissionId');
    const adminEmail = searchParams.get('adminEmail');
    
    const body = await request.json().catch(() => ({}));
    const submissionIds = body.submissionIds;

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'adminEmail is required' },
        { status: 400 }
      );
    }

    if (submissionIds && Array.isArray(submissionIds)) {
      // Bulk remove
      const count = await removeBulkFromValidationQueue(submissionIds, adminEmail);
      return NextResponse.json({ 
        success: true, 
        count 
      });
    } else if (submissionId) {
      // Single remove
      const success = await removeFromValidationQueue(submissionId, adminEmail);
      return NextResponse.json({ 
        success 
      });
    } else {
      return NextResponse.json(
        { error: 'submissionId or submissionIds is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error removing from validation queue:', error);
    return NextResponse.json(
      { error: 'Failed to remove from validation queue', details: error.message },
      { status: 500 }
    );
  }
}
