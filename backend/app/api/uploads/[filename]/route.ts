import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const cleanFilename = path.basename(filename);
    const ext = cleanFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = MIME_TYPES[ext] || 'image/jpeg';

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, cleanFilename);

    // 1. Try local disk
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

    // 2. Try fetching from Cloudflare R2 if not on local disk
    const accountId = process.env.R2_ACCOUNT_ID || 'a535fef343d31f2821a8e89d31f7ea88';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME || 'orion-lk-images';

    if (accessKeyId && secretAccessKey) {
      try {
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

          // Cache locally for next time
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          fs.writeFileSync(filePath, buffer);

          return new NextResponse(buffer, {
            headers: {
              'Content-Type': r2Response.ContentType || contentType,
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (r2Err) {
        console.warn('Failed to fetch from R2:', r2Err);
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
