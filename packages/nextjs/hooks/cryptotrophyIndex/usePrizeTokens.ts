import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchPrizeTokens } from "~~/utils/cryptotrophyIndex/prizeTokens";

export const usePrizeTokens = (user: string) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["prizeTokens", user],
    queryFn: () => fetchPrizeTokens(client, user),
    enabled: !!user,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};
