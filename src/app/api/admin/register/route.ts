import { NextRequest, NextResponse } from 'next/server';
import { createAdmin, getAdminByEmail } from '@/database/admins';

// POST - Register a new admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, adminRole, country, accountStatus } = body;

    if (!name || !email || !password || !adminRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await getAdminByEmail(email);
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      );
    }

    // Create admin in database
    const admin = await createAdmin({
      email,
      name,
      password, // In production, hash this before storing
      admin_role: adminRole as 'super_admin' | 'validator_admin',
      country: country || null,
      account_status: accountStatus || 'active',
    });

    return NextResponse.json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        adminRole: admin.admin_role,
        country: admin.country,
        accountStatus: admin.account_status,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering admin:', error);
    return NextResponse.json(
      { error: 'Failed to register admin', details: error.message },
      { status: 500 }
    );
  }
}
