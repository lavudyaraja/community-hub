import { NextRequest, NextResponse } from 'next/server';
import { createComment, getSubmissionComments, updateComment, deleteComment } from '@/database/comments';

// GET - Get all comments for a submission
export async function GET(
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

    // Comments can be viewed by anyone (user or admin) - no strict auth check needed
    // The submission_id itself provides some level of access control
    const comments = await getSubmissionComments(id);
    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
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

    const body = await request.json();
    const { comment_text, parent_comment_id, author_email, author_type } = body;

    if (!comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (!author_email) {
      return NextResponse.json(
        { error: 'Author email is required' },
        { status: 400 }
      );
    }

    if (!author_type || !['user', 'admin'].includes(author_type)) {
      return NextResponse.json(
        { error: 'Author type must be either "user" or "admin"' },
        { status: 400 }
      );
    }

    const authorEmail = author_email;
    const authorType = author_type as 'user' | 'admin';

    const comment = await createComment({
      submission_id: id,
      author_email: authorEmail,
      author_type: authorType,
      comment_text: comment_text.trim(),
      parent_comment_id: parent_comment_id || null
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const body = await request.json();
    const { comment_id, comment_text, author_email } = body;

    if (!comment_id || !comment_text || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment ID and text are required' },
        { status: 400 }
      );
    }

    if (!author_email) {
      return NextResponse.json(
        { error: 'Author email is required' },
        { status: 400 }
      );
    }

    const authorEmail = author_email;

    const updatedComment = await updateComment(comment_id, comment_text.trim(), authorEmail);
    
    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Comment not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('commentId');
    const authorEmail = searchParams.get('authorEmail');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    if (!authorEmail) {
      return NextResponse.json(
        { error: 'Author email is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteComment(parseInt(commentId), authorEmail, isAdmin);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Comment not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error.message },
      { status: 500 }
    );
  }
}
