import { useGraphQLClient } from "./useGraphQLClient";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganization } from "~~/utils/cryptotrophyIndex/organizations";

export const useOrganization = (id: string) => {
  const client = useGraphQLClient();

  return useQuery({
    queryKey: ["organization", id],
    enabled: !!id,
    queryFn: () => fetchOrganization(client, id),
  });
};
