import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// Upload file to S3
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `resumes/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  });

  await s3Client.send(command);
  
  // Return the S3 URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

// Generate a presigned URL for downloading (optional, for viewing resumes)
export async function getPresignedUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  return signedUrl;
}

// Extract key from S3 URL
export function extractS3Key(url: string): string {
  const regex = new RegExp(`https://${BUCKET_NAME}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`);
  const match = url.match(regex);
  return match ? match[1] : '';
} 