import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

const STATUS_MESSAGES: Record<string, string> = {
  Pending: 'Order has been placed and received by Orion.LK.',
  Processing: 'Order is being verified and prepared for fulfillment.',
  Shipped: 'Package has been dispatched with courier partner. In transit.',
  Delivered: 'Package has been successfully delivered to the recipient.',
  Cancelled: 'Order has been cancelled.',
};

/**
 * GET /api/orders/[id] — get order by MongoDB _id or orderNumber
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);
    const { id } = await params;

    await connectDB();

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { _id: id } : { orderNumber: id.toUpperCase() };

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify permission (admin or order owner)
    const userEmail = decoded.email?.trim().toLowerCase() || '';
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    if (!isAdmin && order.userId !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('[GET /api/orders/[id]]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/orders/[id] — update status or details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);
    const { id } = await params;

    const body = await req.json();
    const { status, note } = body;

    await connectDB();

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { _id: id } : { orderNumber: id.toUpperCase() };

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const userEmail = decoded.email?.trim().toLowerCase() || '';
    const isAdmin = ADMIN_EMAILS.includes(userEmail);
    const isOwner = order.userId === decoded.uid;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Regular users can only cancel their own order if it's currently Pending
    if (!isAdmin && status === 'Cancelled') {
      if (order.status !== 'Pending') {
        return NextResponse.json(
          { error: 'Cannot cancel order that has already been processed or shipped.' },
          { status: 400 }
        );
      }
    } else if (!isAdmin && status && status !== 'Cancelled') {
      return NextResponse.json({ error: 'Only admins can change order status.' }, { status: 403 });
    }

    const prevStatus = order.status;

    if (status && status !== prevStatus) {
      order.status = status;

      // Append tracking update
      const trackingMsg = note || STATUS_MESSAGES[status] || `Status updated to ${status}.`;
      if (!order.trackingUpdates) {
        order.trackingUpdates = [];
      }
      order.trackingUpdates.push({
        status,
        message: trackingMsg,
        timestamp: new Date(),
      });

      // Handle Points Refund if cancelling an order that used points
      if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
        const pointsToRefund = order.pointsUsed || 0;
        const pointsToRevoke = order.pointsEarned || 0;

        const user = await User.findOne({ uid: order.userId });
        if (user) {
          if (user.points === undefined || user.points === null) {
            user.points = 100;
          }
          if (!Array.isArray(user.pointsHistory)) {
            user.pointsHistory = [];
          }

          if (pointsToRefund > 0) {
            user.points = (user.points || 0) + pointsToRefund;
            user.pointsHistory.push({
              amount: pointsToRefund,
              type: 'refund',
              description: `Points refunded for cancelled order ${order.orderNumber}`,
              date: new Date(),
            });
          }

          if (pointsToRevoke > 0) {
            user.points = Math.max(0, (user.points || 0) - pointsToRevoke);
            user.pointsHistory.push({
              amount: -pointsToRevoke,
              type: 'redeemed',
              description: `Revoked earned points for cancelled order ${order.orderNumber}`,
              date: new Date(),
            });
          }

          await user.save();
        }
      }
    }

    await order.save();

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('[PATCH /api/orders/[id]]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/[id] — admin only delete order
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);
    const { id } = await params;

    const userEmail = decoded.email?.trim().toLowerCase() || '';
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await connectDB();
    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId ? { _id: id } : { orderNumber: id.toUpperCase() };

    await Order.findOneAndDelete(query);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/orders/[id]]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
