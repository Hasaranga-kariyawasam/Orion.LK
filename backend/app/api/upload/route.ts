import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { verifyToken } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/** Detect serverless / read-only environments (Vercel, etc.) */
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        await verifyToken(authHeader);
      } catch (tokenErr) {
        console.warn('Upload token check warning:', tokenErr);
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const accountId = process.env.R2_ACCOUNT_ID || 'a535fef343d31f2821a8e89d31f7ea88';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME || 'orion-lk-images';

    let uploadedToR2 = false;

    // 1. Upload to Cloudflare R2 (primary storage — works in serverless)
    if (accessKeyId && secretAccessKey) {
      const R2 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });

      await R2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `uploads/${filename}`,
          Body: buffer,
          ContentType: file.type,
          ContentLength: file.size,
        })
      );
      uploadedToR2 = true;
      console.log(`[upload] Stored to R2: uploads/${filename}`);
    }

    // 2. Optionally save to local disk (only in non-serverless environments)
    if (!IS_SERVERLESS) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadsDir, filename), buffer);
        console.log(`[upload] Saved locally: public/uploads/${filename}`);
      } catch (localErr) {
        console.warn('[upload] Local disk write failed (non-fatal):', localErr);
      }
    }

    if (!uploadedToR2 && IS_SERVERLESS) {
      // On serverless, R2 is required — local disk is not available
      return NextResponse.json(
        { error: 'Image storage is not configured. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in Vercel environment variables.' },
        { status: 500 }
      );
    }

    // Build the public URL for the uploaded file
    const backendUrl =
      process.env.BACKEND_URL ||
      (() => {
        const proto = req.headers.get('x-forwarded-proto') || 'https';
        const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
        return `${proto}://${host}`;
      })();
    const finalUrl = `${backendUrl}/api/uploads/${filename}`;

    return NextResponse.json(
      { url: finalUrl },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('[POST /api/upload]', err);
    if (err.message?.includes('Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
