import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order, { generateOrderNumber } from '@/models/Order';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

/**
 * GET /api/orders — get orders (user's own or all orders for admin)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const isAdminQuery = searchParams.get('admin') === 'true';
    const userEmail = decoded.email?.trim().toLowerCase() || '';

    if (isAdminQuery) {
      if (!ADMIN_EMAILS.includes(userEmail)) {
        return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
      }

      // Fetch all orders with user information
      const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
      const users = await User.find({}).lean();
      const userMap = new Map(users.map((u: any) => [u.uid, u]));

      const enrichedOrders = orders.map((o: any) => {
        const u: any = userMap.get(o.userId);
        return {
          ...o,
          id: o._id.toString(),
          customerName: o.shippingAddress?.name || u?.name || 'Customer',
          customerEmail: u?.email || 'N/A',
          customerPhone: o.shippingAddress?.phone || u?.phone || '',
        };
      });

      return NextResponse.json({ orders: enrichedOrders });
    }

    // Regular user: fetch only their orders
    const orders = await Order.find({ userId: decoded.uid }).sort({ createdAt: -1 });
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error('[GET /api/orders]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/orders — create a new order with points handling
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const decoded = await verifyToken(authHeader);

    const body = await req.json();
    const {
      items,
      subtotal,
      shipping,
      pointsUsed = 0,
      pointsDiscount = 0,
      total,
      shippingAddress,
      paymentMethod,
      notes,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 });
    }

    await connectDB();

    const orderNumber = generateOrderNumber();
    let user = await User.findOne({ uid: decoded.uid });
    if (!user && decoded.email) {
      user = await User.create({
        uid: decoded.uid,
        name: decoded.name || decoded.email.split('@')[0] || 'Customer',
        email: decoded.email,
        points: 100,
        pointsHistory: [
          {
            amount: 100,
            type: 'bonus',
            description: 'Welcome Bonus: 100 Orion Reward Points!',
            date: new Date(),
          },
        ],
      });
    }

    if (user) {
      if (user.points === undefined || user.points === null) {
        user.points = 100;
      }
      if (!Array.isArray(user.pointsHistory)) {
        user.pointsHistory = [];
      }
    }

    // Validate and process points redemption if requested
    const numPointsToUse = Math.max(0, Math.floor(Number(pointsUsed) || 0));
    const discountAmount = Math.max(0, Number(pointsDiscount) || 0);

    if (numPointsToUse > 0) {
      const currentPoints = user?.points ?? 100;
      if (currentPoints < numPointsToUse) {
        return NextResponse.json(
          { error: `Insufficient points balance. You have ${currentPoints} points.` },
          { status: 400 }
        );
      }
    }

    // Calculate points earned from this purchase (1 point per 100 LKR spent on subtotal)
    const effectiveSpend = Math.max(0, (subtotal || 0) - discountAmount);
    const pointsEarned = Math.floor(effectiveSpend / 100);

    // Initial tracking event
    const initialTracking = [
      {
        status: 'Pending',
        message: 'Order received and confirmed by Orion.LK.',
        timestamp: new Date(),
      },
    ];

    const order = await Order.create({
      userId: decoded.uid,
      orderNumber,
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping) || 0,
      pointsUsed: numPointsToUse,
      pointsDiscount: discountAmount,
      pointsEarned,
      total: Number(total),
      status: 'Pending',
      shippingAddress,
      paymentMethod: paymentMethod || 'Card',
      notes,
      trackingUpdates: initialTracking,
    });

    // Update user points ledger in MongoDB
    if (user) {
      if (user.points === undefined || user.points === null) {
        user.points = 100;
      }
      if (!Array.isArray(user.pointsHistory)) {
        user.pointsHistory = [];
      }

      if (numPointsToUse > 0) {
        user.points = Math.max(0, (user.points || 0) - numPointsToUse);
        user.pointsHistory.push({
          amount: -numPointsToUse,
          type: 'redeemed',
          description: `Redeemed on order ${orderNumber}`,
          date: new Date(),
        });
      }

      if (pointsEarned > 0) {
        user.points = (user.points || 0) + pointsEarned;
        user.pointsHistory.push({
          amount: pointsEarned,
          type: 'earned',
          description: `Earned from purchase on order ${orderNumber}`,
          date: new Date(),
        });
      }

      await user.save();
    }

    return NextResponse.json({ order }, { 
      status: 201,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (err: any) {
    console.error('[POST /api/orders]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
