import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getFirebaseAdminApp, verifyToken } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    await connectDB();
    let user = await User.findOne({ uid: decoded.uid }).select('notifications').lean();
    if (!user) {
      const profileEmail = String(decoded.email || `${decoded.uid}@orion.local`).trim().toLowerCase();
      user = await User.create({
        uid: decoded.uid,
        name: decoded.name || profileEmail.split('@')[0] || 'Customer',
        email: profileEmail,
        avatar: decoded.picture || '',
        notifications: [],
      });
    }
    const notifications = (user?.notifications || []).sort(
      (a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );
    return NextResponse.json({ notifications });
  } catch (err: any) {
    console.error('[GET /api/notifications]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    const email = decoded.email?.trim().toLowerCase() || '';
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'Notification title and message are required' }, { status: 400 });
    }

    await connectDB();
    const notification = {
      id: `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: String(body.title).trim(),
      message: String(body.message).trim(),
      time: new Date(),
      isRead: false,
    };
    const firebaseApp = getFirebaseAdminApp();
    if (firebaseApp) {
      let pageToken: string | undefined;
      do {
        const page = await getAuth(firebaseApp).listUsers(1000, pageToken);
        await Promise.all(page.users.map(firebaseUser =>
          User.updateOne(
            { uid: firebaseUser.uid },
            {
              $setOnInsert: {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Customer',
                email: firebaseUser.email || `${firebaseUser.uid}@orion.local`,
                avatar: firebaseUser.photoURL || '',
                addresses: [],
                points: 100,
                pointsHistory: [],
              },
              $push: { notifications: { $each: [notification], $slice: -50 } },
            },
            { upsert: true }
          )
        ));
        pageToken = page.pageToken;
      } while (pageToken);
    } else {
      await User.updateMany(
        {},
        { $push: { notifications: { $each: [notification], $slice: -50 } } }
      );
    }
    return NextResponse.json({ notification }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/notifications]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
