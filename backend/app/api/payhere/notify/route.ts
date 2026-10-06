import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    return NextResponse.json({ error: 'PayHere is not configured.' }, { status: 503 });
  }

  const data = await req.formData();
  const receivedMerchantId = String(data.get('merchant_id') || '');
  const orderId = String(data.get('order_id') || '');
  const amount = String(data.get('payhere_amount') || '');
  const currency = String(data.get('payhere_currency') || '');
  const statusCode = String(data.get('status_code') || '');
  const receivedMd5 = String(data.get('md5sig') || '').toUpperCase();
  const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const expectedMd5 = crypto
    .createHash('md5')
    .update(`${merchantId}${orderId}${amount}${currency}${statusCode}${secretHash}`)
    .digest('hex')
    .toUpperCase();

  if (receivedMerchantId !== merchantId || receivedMd5 !== expectedMd5) {
    return NextResponse.json({ error: 'Invalid PayHere notification.' }, { status: 400 });
  }

  // Order creation remains tied to the authenticated browser callback for now.
  // This endpoint validates PayHere's server notification for future reconciliation.
  return NextResponse.json({ received: true });
}