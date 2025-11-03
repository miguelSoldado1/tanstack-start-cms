import { QueryCache, QueryClient, type QueryClientConfig, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Something went wrong: ${error.message}`);
    },
  }),
};

export function getContext() {
  const queryClient = new QueryClient(queryClientOptions);
  return { queryClient };
}

export function Provider({ children, queryClient }: { children: React.ReactNode; queryClient: QueryClient }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
