import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const cleanFilename = path.basename(filename);
    const ext = cleanFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME_TYPES[ext] || 'image/jpeg';

    // 1. Try local disk (only in non-serverless environments)
    if (!IS_SERVERLESS) {
      try {
        const fs = await import('fs');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadsDir, cleanFilename);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': contentType,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (localErr) {
        console.warn('[uploads] Local disk read failed (non-fatal):', localErr);
      }
    }

    // 2. Fetch from Cloudflare R2
    const accountId = process.env.R2_ACCOUNT_ID || 'a535fef343d31f2821a8e89d31f7ea88';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME || 'orion-lk-images';

    if (accessKeyId && secretAccessKey) {
      const R2 = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
      });

      const r2Response = await R2.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: `uploads/${cleanFilename}`,
        })
      );

      if (r2Response.Body) {
        const byteArray = await r2Response.Body.transformToByteArray();
        const buffer = Buffer.from(byteArray);

        // Cache to local disk only outside serverless environments
        if (!IS_SERVERLESS) {
          try {
            const fs = await import('fs');
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            fs.writeFileSync(path.join(uploadsDir, cleanFilename), buffer);
          } catch {
            // Non-fatal — local caching is an optimization only
          }
        }

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': r2Response.ContentType || contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (err: any) {
    console.error('Error serving image:', err);
    return NextResponse.json({ error: err.message || 'Error serving image' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
