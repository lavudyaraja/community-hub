import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, getAdminByEmail } from '@/database/admins';

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate admin from database
    const admin = await authenticateAdmin(email, password);
    
    if (!admin) {
      // Check if admin exists but password is wrong or account is pending
      const existingAdmin = await getAdminByEmail(email);
      if (existingAdmin) {
        if (existingAdmin.account_status === 'pending') {
          return NextResponse.json(
            { error: 'Account is pending approval' },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }

    // Return admin data (without password)
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        adminRole: admin.admin_role,
        country: admin.country,
        accountStatus: admin.account_status,
      },
    });
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate admin', details: error.message },
      { status: 500 }
    );
  }
}
