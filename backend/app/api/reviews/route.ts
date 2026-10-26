import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/firebase-admin';
import Order from '@/models/Order';
import ProductReview from '@/models/ProductReview';
import Product from '@/models/Product';
import mongoose from 'mongoose';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId')?.trim();
    const adminQuery = searchParams.get('admin') === 'true';

    if (adminQuery) {
      const decoded = await verifyToken(req.headers.get('authorization'));
      if (!ADMIN_EMAILS.includes(decoded.email?.trim().toLowerCase() || '')) {
        return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
      }
      const reviews = await ProductReview.find({}).sort({ status: -1, createdAt: -1 }).lean();
      const productIds = [...new Set(reviews.map(review => review.productId).filter(mongoose.isValidObjectId))];
      const products = await Product.find({ _id: { $in: productIds } }).select('name').lean();
      const productNames = new Map(products.map(product => [String(product._id), product.name]));
      return NextResponse.json({
        reviews: reviews.map(review => ({
          ...review,
          productName: productNames.get(review.productId) || 'Product',
        })),
      });
    }

    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    if (!mongoose.isValidObjectId(productId)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });

    const reviews = await ProductReview.find({ productId, status: 'Approved' })
      .sort({ createdAt: -1 })
      .lean();

    let canReview = false;
    let alreadyReviewed = false;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const decoded = await verifyToken(authHeader);
      const [deliveredOrder, existingReview] = await Promise.all([
        Order.exists({ userId: decoded.uid, status: 'Delivered', 'items.productId': productId }),
        ProductReview.exists({ userId: decoded.uid, productId }),
      ]);
      alreadyReviewed = Boolean(existingReview);
      canReview = Boolean(deliveredOrder) && !alreadyReviewed;
    }

    return NextResponse.json({ reviews, canReview, alreadyReviewed });
  } catch (error: any) {
    console.error('[GET /api/reviews]', error);
    if (error.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    const body = await req.json();
    const productId = String(body.productId || '').trim();
    const rating = Number(body.rating);
    const comment = String(body.comment || '').trim();

    if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    if (!mongoose.isValidObjectId(productId)) return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || comment.length > 2000) {
      return NextResponse.json({ error: 'Review must be between 1 and 2000 characters' }, { status: 400 });
    }

    await connectDB();
    const deliveredOrder = await Order.exists({
      userId: decoded.uid,
      status: 'Delivered',
      'items.productId': productId,
    });
    if (!deliveredOrder) {
      return NextResponse.json({ error: 'A delivered order containing this product is required to review it' }, { status: 403 });
    }

    const review = await ProductReview.create({
      productId,
      userId: decoded.uid,
      customerName: String(decoded.name || decoded.email?.split('@')[0] || 'Customer').trim().slice(0, 80),
      rating,
      comment,
      status: 'Pending',
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
    }
    console.error('[POST /api/reviews]', error);
    if (error.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
