import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

async function requireAdmin(req: NextRequest) {
  const decoded = await verifyToken(req.headers.get('authorization'));
  return ADMIN_EMAILS.includes(decoded.email?.trim().toLowerCase() || '');
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
    const { id } = await params;
    const { status } = await req.json();
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid review status' }, { status: 400 });
    }
    await connectDB();
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ review });
  } catch (err: any) {
    console.error('[PATCH /api/reviews/:id]', err);
    return NextResponse.json({ error: err.message || 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireAdmin(req))) return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
    const { id } = await params;
    await connectDB();
    const review = await Review.findByIdAndDelete(id);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/reviews/:id]', err);
    return NextResponse.json({ error: err.message || 'Failed to delete review' }, { status: 500 });
  }
}