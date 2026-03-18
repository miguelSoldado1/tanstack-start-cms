import { handleRequest, type Router, route } from "@better-upload/server";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/auth";
import { backblazeBucketName, backblazeClient, getBackblazeObjectUrl } from "@/lib/storage/backblaze";

const router: Router = {
  client: backblazeClient,
  bucketName: backblazeBucketName,
  routes: {
    productMultimedia: route({
      fileTypes: ["image/*"],
      multipleFiles: false,
      onBeforeUpload: async (data) => {
        const session = await auth.api.getSession({ headers: data.req.headers });
        if (!session?.user) {
          throw new Error("Not logged in!");
        }
      },
    }),
    profileImage: route({
      fileTypes: ["image/*"],
      multipleFiles: false,
      onBeforeUpload: async (data) => {
        const session = await auth.api.getSession({ headers: data.req.headers });
        if (!session?.user) {
          throw new Error("Not logged in!");
        }
      },
      onAfterSignedUrl: async ({ file }) => ({
        metadata: { imageUrl: getBackblazeObjectUrl(file.objectInfo.key), objectKey: file.objectInfo.key },
      }),
    }),
  },
};

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: ({ request }) => {
        return handleRequest(request, router);
      },
    },
  },
});
