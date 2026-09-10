import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * GET /api/categories
 * Query params: type (brand-new | used)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const filter: Record<string, any> = {};
    if (type && type !== 'all') {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });
    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('[GET /api/categories]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/categories
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const category = await Category.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/categories]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
