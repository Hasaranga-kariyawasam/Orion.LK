import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/firebase-admin';
import Product from '@/models/Product';
import ProductReview from '@/models/ProductReview';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

async function requireAdmin(req: NextRequest) {
  const decoded = await verifyToken(req.headers.get('authorization'));
  if (!ADMIN_EMAILS.includes(decoded.email?.trim().toLowerCase() || '')) {
    throw new Error('Admin access denied');
  }
}

async function refreshProductRating(productId: string) {
  const [result] = await ProductReview.aggregate([
    { $match: { productId, status: 'Approved' } },
    { $group: { _id: '$productId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { $set: { rating: result?.average || 0, reviews: result?.count || 0 } }
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const { status } = await req.json();
    if (!['Pending', 'Approved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid review status' }, { status: 400 });
    }

    await connectDB();
    const review = await ProductReview.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    await refreshProductRating(review.productId);
    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('[PATCH /api/reviews/[id]]', error);
    if (error.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Admin access denied') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await connectDB();
    const review = await ProductReview.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    await refreshProductRating(review.productId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DELETE /api/reviews/[id]]', error);
    if (error.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'Admin access denied') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
