import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * GET /api/wishlist
 * Returns the current user's wishlist product IDs.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    await connectDB();
    const user = await User.findOne({ uid: decoded.uid }).select('wishlist');
    return NextResponse.json({ productIds: user?.wishlist ?? [] });
  } catch (err: any) {
    console.error('[GET /api/wishlist]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/wishlist
 * Replaces the current user's wishlist with the provided product ID array.
 * Body: { productIds: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const { productIds } = await req.json();
    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 });
    }

    await connectDB();
    await User.findOneAndUpdate(
      { uid: decoded.uid },
      { $set: { wishlist: productIds } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, productIds });
  } catch (err: any) {
    console.error('[POST /api/wishlist]', err);
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
