import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganizations } from "~~/utils/cryptotrophyIndex/organizations";

export const useOrganizations = (pageSize: number, after?: string | null, before?: string | null, search?: string) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["organizations", pageSize, after, before, search],
    queryFn: () => fetchOrganizations(client, pageSize, after, before, search),
    refetchInterval: 10000, // auto-refresh every 10 seconds
    refetchIntervalInBackground: true,
  });
};
