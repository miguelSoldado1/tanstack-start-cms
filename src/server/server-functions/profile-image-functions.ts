import { ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { deleteObject } from "@better-upload/server/helpers";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { auth } from "@/lib/auth/auth";
import { authMiddleware } from "@/lib/auth/auth-middleware";
import { db } from "@/lib/database/drizzle";
import { user } from "@/lib/database/schema";
import { backblazeBucketName, backblazeClient, backblazeS3Client } from "@/lib/storage/backblaze";

const saveProfileImageInput = z.object({
  imageKey: z.string().min(1),
  imageUrl: z.url(),
});

async function getCurrentImageKey(userId: string) {
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { imageKey: true },
  });

  return currentUser?.imageKey?.trim() || null;
}

async function getImageVersionIds(imageKey: string) {
  const versionIds = new Set<string>();
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;

  do {
    const response = await backblazeS3Client.send(
      new ListObjectVersionsCommand({
        Bucket: backblazeBucketName,
        Prefix: imageKey,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      })
    );

    for (const version of response.Versions ?? []) {
      if (version.Key === imageKey && version.VersionId) {
        versionIds.add(version.VersionId);
      }
    }

    for (const marker of response.DeleteMarkers ?? []) {
      if (marker.Key === imageKey && marker.VersionId) {
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

async function deleteProfileImageObject(imageKey: string | null, errorMessage: string) {
  if (!imageKey) return;

  try {
    const versionIds = await getImageVersionIds(imageKey);

    if (versionIds.length === 0) {
      await deleteObject(backblazeClient, { bucket: backblazeBucketName, key: imageKey });

      return;
    }

    await Promise.all(
      versionIds.map((versionId) => deleteObject(backblazeClient, { bucket: backblazeBucketName, key: imageKey, versionId }))
    );
  } catch (error) {
    console.error(errorMessage, error);
  }
}

async function saveProfileImageHandler(userId: string, input: z.infer<typeof saveProfileImageInput>) {
  const previousImageKey = await getCurrentImageKey(userId);
  const headers = getRequestHeaders();

  try {
    await db.update(user).set({ imageKey: input.imageKey, updatedAt: new Date() }).where(eq(user.id, userId));

    await auth.api.updateUser({
      headers,
      body: { image: input.imageUrl },
    });
  } catch (error) {
    await db.update(user).set({ imageKey: previousImageKey, updatedAt: new Date() }).where(eq(user.id, userId));

    await deleteProfileImageObject(input.imageKey, "Failed to clean up uploaded profile image after database error");
    throw error;
  }

  if (previousImageKey && previousImageKey !== input.imageKey) {
    await deleteProfileImageObject(previousImageKey, "Failed to delete previous profile image from Backblaze");
  }
}

export const saveProfileImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(saveProfileImageInput)
  .handler(({ context, data }) => saveProfileImageHandler(context.user.id, data));

async function removeProfileImageHandler(userId: string) {
  const imageKey = await getCurrentImageKey(userId);
  const headers = getRequestHeaders();

  try {
    await db.update(user).set({ imageKey: null, updatedAt: new Date() }).where(eq(user.id, userId));

    await auth.api.updateUser({ headers, body: { image: null } });
  } catch (error) {
    await db.update(user).set({ imageKey, updatedAt: new Date() }).where(eq(user.id, userId));

    throw error;
  }

  await deleteProfileImageObject(imageKey, "Failed to delete profile image from Backblaze");
}

export const removeProfileImage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(({ context }) => removeProfileImageHandler(context.user.id));
