import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * GET /api/cart
 * Returns the current user's saved cart items.
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    await connectDB();
    let user = await User.findOne({ uid: decoded.uid }).select('cart');

    if (!user && decoded.email) {
      user = await User.create({
        uid: decoded.uid,
        name: decoded.name || decoded.email.split('@')[0] || 'Customer',
        email: decoded.email,
        avatar: decoded.picture || '',
        addresses: [],
        wishlist: [],
        cart: [],
      });
    }

    return NextResponse.json({ cart: user?.cart ?? [] });
  } catch (err: any) {
    console.error('[GET /api/cart]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Replaces the current user's cart in the database.
 * Body: { cart: Array<{ productId: string, quantity: number, product?: any }> }
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const body = await req.json();
    const { cart } = body;
    if (!Array.isArray(cart)) {
      return NextResponse.json({ error: 'cart must be an array' }, { status: 400 });
    }

    await connectDB();
    await User.findOneAndUpdate(
      { uid: decoded.uid },
      {
        $set: { cart },
        $setOnInsert: {
          uid: decoded.uid,
          email: decoded.email || '',
          name: decoded.name || decoded.email?.split('@')[0] || 'Customer',
          avatar: decoded.picture || '',
          addresses: [],
          wishlist: [],
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, cart });
  } catch (err: any) {
    console.error('[POST /api/cart]', err);
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
