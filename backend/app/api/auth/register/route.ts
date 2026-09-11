import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * POST /api/auth/register
 * Called right after Firebase signup to create the MongoDB user profile.
 * Body: { name, email }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const { name, email } = await req.json();

    await connectDB();

    // Upsert — safe to call on re-register / Google sign-in
    const user = await User.findOneAndUpdate(
      { uid: decoded.uid },
      {
        $setOnInsert: {
          uid: decoded.uid,
          name: name || decoded.name || 'User',
          email: email || decoded.email,
          avatar: decoded.picture || '',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, user }, { 
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    console.error('[POST /api/auth/register]', err);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
