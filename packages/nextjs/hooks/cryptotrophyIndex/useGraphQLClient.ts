import { useMemo } from "react";
import { GraphQLClient } from "graphql-request";

export const useGraphQLClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";
  return useMemo(() => new GraphQLClient(endpoint), [endpoint]);
};
