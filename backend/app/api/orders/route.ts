import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { generateOrderNumber } from '@/models/Order';
import { verifyToken } from '@/lib/firebase-admin';

/**
 * GET /api/orders — get current user's orders
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    await connectDB();
    const orders = await Order.find({ userId: decoded.uid }).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('[GET /api/orders]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/orders — create a new order
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const body = await req.json();

    await connectDB();
    const order = await Order.create({
      ...body,
      userId: decoded.uid,
      orderNumber: generateOrderNumber(),
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/orders]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
