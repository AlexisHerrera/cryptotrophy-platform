import { executeQuery } from "./indexClient";
import type { PrizeData } from "./types";
import type { GraphQLClient } from "graphql-request";

const GET_PRIZES_QUERY = `
query GetPrizes($limit: Int!, $after: String, $before: String, $orgId: String, $name: String) {
  prizes(
    limit: $limit,
    after: $after,
    before: $before,
    where: {
      orgId: $orgId,
      name_contains: $name
    }
  ) {
    totalCount
    items {
      id
      orgId
      name
      description
      price
      stock
      nftContract
      baseURI
    }
    pageInfo {
      endCursor
      startCursor
      hasNextPage
      hasPreviousPage
    }
  }
}
`;

export async function fetchPrizes(
  client: GraphQLClient,
  limit: number,
  after?: string | null,
  before?: string | null,
  orgId?: string,
  name?: string,
): Promise<PrizeData> {
  return executeQuery<PrizeData>(client, GET_PRIZES_QUERY, {
    limit,
    after,
    before,
    orgId,
    name,
  });
}
