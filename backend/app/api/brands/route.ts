import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Brand from '@/models/Brand';

/**
 * GET /api/brands
 */
export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find({}).sort({ name: 1 });
    return NextResponse.json({ brands });
  } catch (err: any) {
    console.error('[GET /api/brands]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/brands
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://orion-lk.vercel.app',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    const brand = await Brand.create(body);
    return NextResponse.json({ brand }, { status: 201 });
  } catch (err: any) {
    console.error('[POST /api/brands]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
