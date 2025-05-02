import { executeQuery } from "./indexClient";
import type { ChallengeData } from "./types";
import type { GraphQLClient } from "graphql-request";

export const GET_CHALLENGES_QUERY = `
  query GetChallenges($limit: Int!, $after: String, $before: String, $orgId: String, $description: String) {
    challenges(limit: $limit, after: $after, before: $before, where: {description_contains: $description, orgId: $orgId}) {
      totalCount
      items {
        validatorUID
        validatorAddr
        validationId
        startTime
        prizeAmount
        orgId
        maxWinners
        isActive
        id
        endTime
        description
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

export async function fetchChallenges(
  client: GraphQLClient,
  limit: number,
  after?: string | null,
  before?: string | null,
  orgId?: string,
  description?: string,
): Promise<ChallengeData> {
  return executeQuery<ChallengeData>(client, GET_CHALLENGES_QUERY, {
    limit,
    after,
    before,
    orgId,
    description,
  });
}
