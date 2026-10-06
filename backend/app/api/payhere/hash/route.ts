import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';

const CURRENCY = 'LKR';

function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export async function POST(req: NextRequest) {
  try {
    await verifyToken(req.headers.get('authorization'));

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      return NextResponse.json({ error: 'PayHere is not configured on the server.' }, { status: 503 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'A valid payment amount is required.' }, { status: 400 });
    }

    const orderId = `PAY-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const formattedAmount = formatAmount(amount);
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hash = crypto
      .createHash('md5')
      .update(`${merchantId}${orderId}${formattedAmount}${CURRENCY}${secretHash}`)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      merchantId,
      orderId,
      amount: formattedAmount,
      currency: CURRENCY,
      hash,
      sandbox: process.env.PAYHERE_SANDBOX !== 'false',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to prepare PayHere payment.' }, { status: 401 });
  }
}