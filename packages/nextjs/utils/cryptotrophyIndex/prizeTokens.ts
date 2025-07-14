import { executeQuery } from "./indexClient";
import type { PrizeTokenData } from "./types";
import type { GraphQLClient } from "graphql-request";

const GET_PRIZES_QUERY = `
query GetPrizeTokens($claimer: String) {
  prizeTokens(
    where: {
      claimer: $claimer
    }
  ) {
    totalCount
    items {
      prizeId
      nftId
      claimer
      claimId
    }
  }
}
`;

export async function fetchPrizeTokens(client: GraphQLClient, user: string): Promise<PrizeTokenData> {
  return executeQuery<PrizeTokenData>(client, GET_PRIZES_QUERY, {
    user,
  });
}
