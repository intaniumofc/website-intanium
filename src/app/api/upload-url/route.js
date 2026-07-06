import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(request) {
  try {
    const body = await request.json();
    const { fileName, fileType, bucketName = 'assets', folderPath = 'media' } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2EndpointRaw = process.env.NEXT_PUBLIC_R2_ENDPOINT || '';
    const r2BucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || 'intanium-storage';

    if (!accessKeyId || !secretAccessKey || !r2EndpointRaw) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
    }

    // Extract just the host part for the S3 client endpoint
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

    const cleanFolderPath = folderPath.replace(/^\//, '');
    const cleanBucketName = bucketName.replace(/^\//, '');
    const fullPath = `${cleanBucketName}/${cleanFolderPath}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: fullPath,
      ContentType: fileType,
      CacheControl: 'max-age=31536000',
    });

    // Generate pre-signed URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';
    const publicUrl = `${publicUrlBase.replace(/\/$/, '')}/${fullPath}`;

    return NextResponse.json({
      uploadUrl: signedUrl,
      publicUrl: publicUrl,
      key: fullPath,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
