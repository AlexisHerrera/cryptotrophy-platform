import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchPrizes } from "~~/utils/cryptotrophyIndex/prizes";

export const usePrizes = (
  orgId: string,
  pageSize: number,
  after?: string | null,
  before?: string | null,
  search?: string,
) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["prizes", pageSize, after, before, search],
    queryFn: () => fetchPrizes(client, pageSize, after, before, orgId, search),
    refetchInterval: 10000, // auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  });
};
