import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/auth/requireAdmin';

function getR2Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2EndpointRaw = process.env.NEXT_PUBLIC_R2_ENDPOINT || '';
  if (!accessKeyId || !secretAccessKey || !r2EndpointRaw) {
    throw new Error('R2 configuration missing');
  }
  const endpointUrl = new URL(r2EndpointRaw);
  return new S3Client({
    region: 'auto',
    endpoint: `${endpointUrl.protocol}//${endpointUrl.host}`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucketName() {
  return process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'iris-storage';
}

export async function GET(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const maxKeys = Math.min(parseInt(searchParams.get('maxKeys') || '200', 10), 1000);

    const s3Client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: getBucketName(),
      Prefix: prefix || undefined,
      MaxKeys: maxKeys,
    });

    const response = await s3Client.send(command);
    const publicUrlBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '');
    const items = (response.Contents || []).map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
      url: `${publicUrlBase}/${obj.Key}`,
    }));

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      isTruncated: response.IsTruncated,
      prefix,
    });
  } catch (err) {
    console.error('Media Manager GET error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { keys } = body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'No keys provided' }, { status: 400 });
    }
    if (keys.length > 1000) {
      return NextResponse.json({ error: 'Too many keys (max 1000)' }, { status: 400 });
    }

    const s3Client = getR2Client();
    const command = new DeleteObjectsCommand({
      Bucket: getBucketName(),
      Delete: {
        Objects: keys.map((k) => ({ Key: k })),
        Quiet: false,
      },
    });

    const response = await s3Client.send(command);
    const deleted = (response.Deleted || []).map((d) => d.Key);
    const errors = (response.Errors || []).map((e) => ({ key: e.Key, message: e.Message }));

    return NextResponse.json({
      success: true,
      deleted,
      deletedCount: deleted.length,
      errors,
      errorsCount: errors.length,
    });
  } catch (err) {
    console.error('Media Manager DELETE error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}
