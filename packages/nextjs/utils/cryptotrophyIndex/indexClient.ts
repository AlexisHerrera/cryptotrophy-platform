import { GraphQLClient } from "graphql-request";

export function createIndexClient(endpoint: string): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: { "Content-Type": "application/json" },
  });
}

export async function executeQuery<T>(
  client: GraphQLClient,
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  return client.request<T>(query, variables);
}
