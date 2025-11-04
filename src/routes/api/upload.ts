import { createFileRoute } from "@tanstack/react-router";
import { handleRequest, type Router, route } from "better-upload/server";
import { backblaze } from "better-upload/server/helpers";
import { env } from "env";
import { auth } from "@/lib/auth/auth";

const client = backblaze({
  region: env.BACKBLAZE_REGION,
  applicationKeyId: env.BACKBLAZE_APPLICATION_KEY_ID,
  applicationKey: env.BACKBLAZE_APPLICATION_KEY,
});

const router: Router = {
  client,
  bucketName: env.BACKBLAZE_BUCKET_NAME,
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
