import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchChallenges } from "~~/utils/cryptotrophyIndex/challenges";

export const useChallenges = (
  orgId: string,
  pageSize: number,
  after?: string | null,
  before?: string | null,
  search?: string,
  activeStates?: boolean[],
) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["challenges", orgId, pageSize, after, before, search, activeStates],
    queryFn: () => fetchChallenges(client, pageSize, after, before, orgId, search, activeStates),
    refetchInterval: 10000, // auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  });
};
