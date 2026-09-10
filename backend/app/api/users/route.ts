import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    await verifyToken(authHeader);

    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    
    // Fetch orders to calculate dynamic user order stats
    const orders = await Order.find({}).lean();

    const enrichedUsers = users.map((u: any) => {
      const userOrders = orders.filter((o: any) => o.userId === u.uid);
      const totalSpent = userOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const isAdmin = u.email?.trim().toLowerCase() === 'orian@admin.lk' || u.email?.trim().toLowerCase() === 'orion@admin.lk';

      return {
        id: u._id.toString(),
        uid: u.uid,
        name: u.name || 'User',
        email: u.email,
        phone: u.phone || '',
        avatar: u.avatar || '',
        joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2024-01-01',
        orders: userOrders.length,
        totalSpent,
        isAdmin,
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (err: any) {
    console.error('[GET /api/users]', err);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
