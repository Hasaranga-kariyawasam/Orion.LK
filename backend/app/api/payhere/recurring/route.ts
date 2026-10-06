import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

const CURRENCY = 'LKR';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(req: NextRequest) {
  try {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      return NextResponse.json({ error: 'PayHere is not configured on the server.' }, { status: 503 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const requiredFields = ['recurrence', 'duration', 'firstName', 'lastName', 'email', 'phone', 'address', 'city'];
    if (!Number.isFinite(amount) || amount <= 0 || requiredFields.some(field => !String(body[field] || '').trim())) {
      return NextResponse.json({ error: 'Complete recurring payment details are required.' }, { status: 400 });
    }

    const orderId = `SUB-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const formattedAmount = amount.toFixed(2);
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hash = crypto.createHash('md5')
      .update(`${merchantId}${orderId}${formattedAmount}${CURRENCY}${secretHash}`)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      actionUrl: process.env.PAYHERE_SANDBOX === 'false' ? 'https://www.payhere.lk/pay/checkout' : 'https://sandbox.payhere.lk/pay/checkout',
      merchant_id: merchantId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payhere-sandbox/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/payhere-sandbox/cancel`,
      notify_url: `${BACKEND_URL}/api/payhere/notify`,
      order_id: orderId,
      items: `Orion Sandbox Subscription (${body.recurrence})`,
      currency: CURRENCY,
      recurrence: String(body.recurrence),
      duration: String(body.duration),
      amount: formattedAmount,
      hash,
      first_name: String(body.firstName),
      last_name: String(body.lastName),
      email: String(body.email),
      phone: String(body.phone),
      address: String(body.address),
      city: String(body.city),
      country: 'Sri Lanka',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unable to prepare recurring PayHere payment.' }, { status: 401 });
  }
}