import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * GET /api/auth/me
 * Returns the current user's MongoDB profile.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    await connectDB();
    let user = await User.findOne({ uid: decoded.uid });

    if (!user && decoded.email) {
      user = await User.create({
        uid: decoded.uid,
        name: decoded.name || decoded.email.split('@')[0] || 'Customer',
        email: decoded.email,
        avatar: decoded.picture || '',
        addresses: [],
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('[GET /api/auth/me]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://orion-lk.vercel.app',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * PATCH /api/auth/me
 * Update the current user's profile (name, phone, avatar, addresses).
 */
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const body = await req.json();
    const allowedFields = ['name', 'phone', 'avatar', 'addresses'];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { uid: decoded.uid },
      { 
        $set: updates,
        $setOnInsert: {
          uid: decoded.uid,
          email: decoded.email || '',
          name: decoded.name || 'User',
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('[PATCH /api/auth/me]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
