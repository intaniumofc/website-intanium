import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucketName = formData.get('bucketName') || 'assets';
    const folderPath = formData.get('folderPath') || 'media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2EndpointRaw = process.env.NEXT_PUBLIC_R2_ENDPOINT || '';
    const r2BucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'intanium-storage';

    if (!accessKeyId || !secretAccessKey || !r2EndpointRaw) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    const endpointUrl = new URL(r2EndpointRaw);
    const endpoint = `${endpointUrl.protocol}//${endpointUrl.host}`;

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const fileExt = file.name.split('.').pop() || 'webp';
    const fileName = `${Math.random().toString(36).substring(2, 9) + Date.now().toString(36)}.${fileExt}`;

    const cleanFolderPath = folderPath.replace(/^\//, '');
    const cleanBucketName = bucketName.replace(/^\//, '');
    const fullPath = `${cleanBucketName}/${cleanFolderPath}/${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: fullPath,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=31536000',
    });

    await s3Client.send(command);

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${fullPath}`;

    return NextResponse.json({
      publicUrl: publicUrl,
      key: fullPath,
    });
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
