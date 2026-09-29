import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * GET /api/orders/track?orderNumber=... — public order tracking endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
    }

    await connectDB();

    // Look up by order number (case-insensitive)
    const order = await Order.findOne({
      orderNumber: { $regex: new RegExp(`^${orderNumber}$`, 'i') },
    }).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      order: {
        id: (order as any)._id.toString(),
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        status: order.status,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        pointsDiscount: order.pointsDiscount || 0,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        trackingUpdates: order.trackingUpdates || [],
      },
    });
  } catch (err: any) {
    console.error('[GET /api/orders/track]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
