import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { requireAdmin, validateFile } from '@/lib/auth/requireAdmin';
import sharp from 'sharp';

const MAX_IMAGE_DIMENSION = 1600;
const WEBP_QUALITY = 82;
const SKIP_PREFIXES = ['audio/'];

async function maybeCompressImage(file, buffer) {
  if (!file.type || !file.type.startsWith('image/')) return { buffer, contentType: file.type, ext: (file.name.split('.').pop() || 'webp') };
  try {
    const metadata = await sharp(buffer).metadata();
    let pipeline = sharp(buffer, { failOn: 'truncated' }).rotate();
    if ((metadata.width || 0) > MAX_IMAGE_DIMENSION || (metadata.height || 0) > MAX_IMAGE_DIMENSION) {
      pipeline = pipeline.resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: 'inside', withoutEnlargement: true });
    }
    const webpBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    return { buffer: webpBuffer, contentType: 'image/webp', ext: 'webp' };
  } catch (err) {
    console.warn('Sharp compression failed, falling back to original buffer:', err.message);
    return { buffer, contentType: file.type, ext: (file.name.split('.').pop() || 'webp') };
  }
}

export async function POST(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucketName = formData.get('bucketName') || 'assets';
    const folderPath = formData.get('folderPath') || 'media';

    const { error: fileErr } = validateFile(file, {
      allowedTypes: ['image/', 'audio/'],
      maxBytes: 10 * 1024 * 1024,
    });
    if (fileErr) return fileErr;

    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2EndpointRaw = process.env.NEXT_PUBLIC_R2_ENDPOINT || '';
    const r2BucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'iris-storage';

    if (!accessKeyId || !secretAccessKey || !r2EndpointRaw) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const endpointUrl = new URL(r2EndpointRaw);
    const endpoint = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    const rawBuffer = Buffer.from(await file.arrayBuffer());
    const shouldSkip = SKIP_PREFIXES.some((p) => file.type && file.type.startsWith(p));
    const { buffer: finalBuffer, contentType, ext } = shouldSkip
      ? { buffer: rawBuffer, contentType: file.type, ext: (file.name.split('.').pop() || 'bin') }
      : await maybeCompressImage(file, rawBuffer);

    const fileName = `${Math.random().toString(36).substring(2, 9) + Date.now().toString(36)}.${ext}`;
    const cleanFolderPath = folderPath.replace(/^\//, '').replace(/\.\./g, '');
    const cleanBucketName = bucketName.replace(/^\//, '').replace(/\.\./g, '');
    const fullPath = `${cleanBucketName}/${cleanFolderPath}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: fullPath,
      Body: finalBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000',
    });

    await s3Client.send(command);

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${fullPath}`;

    return NextResponse.json({
      publicUrl,
      key: fullPath,
      compressed: ext === 'webp' && file.type !== 'image/webp',
      originalSize: rawBuffer.length,
      finalSize: finalBuffer.length,
    });
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}