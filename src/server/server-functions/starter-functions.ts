import { createServerFn } from "@tanstack/react-start";
import { env } from "env";

function getStarterFeaturesHandler() {
  return {
    authProviders: {
      google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
      github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    },
  };
}

export const getStarterFeatures = createServerFn().handler(() => getStarterFeaturesHandler());
