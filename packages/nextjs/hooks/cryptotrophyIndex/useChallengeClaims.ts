import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchChallengeClaims } from "~~/utils/cryptotrophyIndex/challengeClaims";

export const useChallengeClaims = (user: string, challenges: string[]) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["rewardClaims", user, challenges],
    queryFn: () => fetchChallengeClaims(client, user, challenges),
    enabled: !!user && challenges.length > 0,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};
