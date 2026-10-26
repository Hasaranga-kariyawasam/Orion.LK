import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomeSettings from '@/models/HomeSettings';
import { verifyToken } from '@/lib/firebase-admin';

const ADMIN_EMAILS = ['orian@admin.lk', 'orion@admin.lk'];

export async function GET() {
  try {
    await connectDB();
    const settings = await HomeSettings.findOne({ key: 'default' }).lean();
    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    console.error('[GET /api/home-settings]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const decoded = await verifyToken(req.headers.get('authorization'));
    if (!ADMIN_EMAILS.includes(decoded.email?.trim().toLowerCase() || '')) {
      return NextResponse.json({ error: 'Access denied: Admin only' }, { status: 403 });
    }
    const body = await req.json();
    await connectDB();
    const settings = await HomeSettings.findOneAndUpdate(
      { key: 'default' },
      {
        $set: {
          heroImages: Array.isArray(body.heroImages) ? body.heroImages : [],
          featuredImages: Array.isArray(body.featuredImages) ? body.featuredImages : [],
          pcBuildCards: Array.isArray(body.pcBuildCards) ? body.pcBuildCards : [],
          homePromoCards: Array.isArray(body.homePromoCards) ? body.homePromoCards : [],
          brandBanner: body.brandBanner && typeof body.brandBanner === 'object' ? body.brandBanner : {},
          secondBannerImage: String(body.secondBannerImage || ''),
          homeProductCategories: Array.isArray(body.homeProductCategories)
            ? body.homeProductCategories.map(String)
            : [],
          bestSellerBannerImage: String(body.bestSellerBannerImage || ''),
          pcBuildCategoryMap: body.pcBuildCategoryMap && typeof body.pcBuildCategoryMap === 'object'
            ? body.pcBuildCategoryMap
            : {},
          accessories: Array.isArray(body.accessories) ? body.accessories : [],
          bestSellerIds: Array.isArray(body.bestSellerIds) ? body.bestSellerIds : [],
          whatsappNumber: String(body.whatsappNumber || ''),
          storeAddress: String(body.storeAddress || ''),
          specialOffers: Array.isArray(body.specialOffers) ? body.specialOffers : [],
          specialOffersDeadline: String(body.specialOffersDeadline || ''),
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return NextResponse.json(
      { settings },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    console.error('[PUT /api/home-settings]', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
