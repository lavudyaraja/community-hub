import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotifications,
  createNotification,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '@/database/notifications';

// GET - Get all notifications for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userEmail = searchParams.get('userEmail');
    const countOnly = searchParams.get('countOnly') === 'true';

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    if (countOnly) {
      const count = await getUnreadNotificationCount(userEmail);
      return NextResponse.json({ count });
    }

    const notifications = await getUserNotifications(userEmail);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_email, type, title, message, action_url } = body;

    if (!user_email || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_email, type, title, message' },
        { status: 400 }
      );
    }

    const notification = await createNotification({
      user_email,
      type,
      title,
      message,
      action_url
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read or mark all as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userEmail, markAll } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    if (markAll) {
      const count = await markAllNotificationsAsRead(userEmail);
      return NextResponse.json({ 
        success: true, 
        message: `Marked ${count} notifications as read` 
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required when markAll is false' },
        { status: 400 }
      );
    }

    const notification = await markNotificationAsRead(notificationId, userEmail);
    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const notificationId = searchParams.get('notificationId');
    const userEmail = searchParams.get('userEmail');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (!userEmail) {
      return NextResponse.json(
        { error: 'userEmail is required' },
        { status: 400 }
      );
    }

    if (deleteAll) {
      const count = await deleteAllNotifications(userEmail);
      return NextResponse.json({ 
        success: true, 
        message: `Deleted ${count} notifications` 
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required when deleteAll is false' },
        { status: 400 }
      );
    }

    const deleted = await deleteNotification(notificationId, userEmail);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification', details: error.message },
      { status: 500 }
    );
  }
}
