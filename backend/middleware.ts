import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigin = 'https://orion-lk-cn6d.vercel.app/';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight requests (OPTIONS) වලට 200 return කරන්න
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};