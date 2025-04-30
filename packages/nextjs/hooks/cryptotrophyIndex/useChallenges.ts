import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChallenges } from "~~/utils/cryptotrophyIndex/challenges";
import type { ChallengeData } from "~~/utils/cryptotrophyIndex/types";

export const useChallenges = (
  orgId: string,
  pageSize: number,
  after?: string | null,
  before?: string | null,
  search?: string,
) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["challenges", orgId, pageSize, after, before, search],
    queryFn: () => fetchChallenges(client, pageSize, after, before, orgId, search),
    refetchInterval: 10000, // auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  });
};

export const useInvalidateChallenges = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["challenges"] });
};
