import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    const { id } = await params;
    await connectDB();
    const email = decoded.email?.trim().toLowerCase() || '';
    if (ADMIN_EMAILS.includes(email)) {
      await User.updateMany({}, { $pull: { notifications: { id } } });
    } else {
      await User.updateOne({ uid: decoded.uid }, { $pull: { notifications: { id } } });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/notifications/:id]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
