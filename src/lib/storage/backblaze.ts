import { S3Client } from "@aws-sdk/client-s3";
import { backblaze } from "@better-upload/server/clients";
import { env } from "env";

export const backblazeClient = backblaze({
  region: env.BACKBLAZE_REGION,
  applicationKeyId: env.BACKBLAZE_APPLICATION_KEY_ID,
  applicationKey: env.BACKBLAZE_APPLICATION_KEY,
});

export const backblazeBucketName = env.BACKBLAZE_BUCKET_NAME;

export const backblazeS3Client = new S3Client({
  region: env.BACKBLAZE_REGION,
  endpoint: `https://s3.${env.BACKBLAZE_REGION}.backblazeb2.com`,
  credentials: {
    accessKeyId: env.BACKBLAZE_APPLICATION_KEY_ID,
    secretAccessKey: env.BACKBLAZE_APPLICATION_KEY,
  },
});

export function getBackblazeObjectUrl(key: string) {
  return `https://f003.backblazeb2.com/file/${backblazeBucketName}/${key}`;
}
