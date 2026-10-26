import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const mine = searchParams.get('mine') === 'true';
    const admin = searchParams.get('admin') === 'true';
    const filter: Record<string, unknown> = {};

    if (mine || admin) {
      const decoded = await verifyToken(req.headers.get('authorization'));
      if (mine) filter.userId = decoded.uid;
      if (admin && !ADMIN_EMAILS.includes(decoded.email?.trim().toLowerCase() || '')) {
        return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
      }
    } else {
      filter.status = 'Approved';
      if (!productId) return NextResponse.json({ reviews: [] });
    }

    if (productId) filter.productId = productId;
    await connectDB();
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error('[GET /api/reviews]', err);
    return NextResponse.json({ error: err.message || 'Failed to load reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    const body = await req.json();
    const productId = String(body.productId || '').trim();
    const orderNumber = String(body.orderNumber || '').trim().toUpperCase();
    const rating = Number(body.rating);
    const comment = String(body.comment || '').trim();

    if (!productId || !orderNumber || !Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json({ error: 'Provide a valid product, delivered order, rating, and review.' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findOne({ userId: decoded.uid, orderNumber, status: 'Delivered' });
    const purchasedItem = order?.items.find(item => item.productId === productId);
    if (!order || !purchasedItem) {
      return NextResponse.json({ error: 'Reviews are available only for products in delivered orders.' }, { status: 403 });
    }

    const review = await Review.create({
      userId: decoded.uid,
      productId,
      productName: purchasedItem.name,
      orderNumber,
      customerName: String(body.customerName || decoded.name || decoded.email?.split('@')[0] || 'Verified Customer').trim().slice(0, 80),
      customerEmail: String(decoded.email || ''),
      rating,
      comment,
      status: 'Pending',
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) return NextResponse.json({ error: 'You already reviewed this product for that order.' }, { status: 409 });
    console.error('[POST /api/reviews]', err);
    if (err.message?.includes('Authorization')) return NextResponse.json({ error: 'Sign in to submit a review.' }, { status: 401 });
    return NextResponse.json({ error: err.message || 'Failed to submit review' }, { status: 500 });
  }
}