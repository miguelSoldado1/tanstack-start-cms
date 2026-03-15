import { ListObjectVersionsCommand, S3Client } from "@aws-sdk/client-s3";
import { backblaze } from "@better-upload/server/clients";
import { deleteObject } from "@better-upload/server/helpers";
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

export function getBackblazeObjectKey(url: string) {
  try {
    const objectUrl = new URL(url);
    const pathnamePrefix = `/file/${backblazeBucketName}/`;

    if (!objectUrl.pathname.startsWith(pathnamePrefix)) {
      return null;
    }

    return decodeURIComponent(objectUrl.pathname.slice(pathnamePrefix.length));
  } catch {
    return null;
  }
}

async function getBackblazeObjectVersionIds(objectKey: string) {
  const versionIds = new Set<string>();
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;

  do {
    const response = await backblazeS3Client.send(
      new ListObjectVersionsCommand({
        Bucket: backblazeBucketName,
        Prefix: objectKey,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      })
    );

    for (const version of response.Versions ?? []) {
      if (version.Key === objectKey && version.VersionId) {
        versionIds.add(version.VersionId);
      }
    }

    for (const marker of response.DeleteMarkers ?? []) {
      if (marker.Key === objectKey && marker.VersionId) {
        versionIds.add(marker.VersionId);
      }
    }

    if (!response.IsTruncated) {
      break;
    }

    keyMarker = response.NextKeyMarker;
    versionIdMarker = response.NextVersionIdMarker;
  } while (keyMarker);

  return [...versionIds];
}

export async function deleteBackblazeObject(objectKey: string) {
  const versionIds = await getBackblazeObjectVersionIds(objectKey);

  if (versionIds.length === 0) {
    await deleteObject(backblazeClient, { bucket: backblazeBucketName, key: objectKey });
    return;
  }

  await Promise.all(
    versionIds.map((versionId) => deleteObject(backblazeClient, { bucket: backblazeBucketName, key: objectKey, versionId }))
  );
}
