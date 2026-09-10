import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

/**
 * GET /api/products
 * Query params: category, search, sort, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    const sortMap: Record<string, any> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    console.error('[GET /api/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/products (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
