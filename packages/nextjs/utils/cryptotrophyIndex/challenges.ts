import { executeQuery } from "./indexClient";
import type { ChallengeData } from "./types";
import type { GraphQLClient } from "graphql-request";

export const GET_CHALLENGES_QUERY = `
  query GetChallenges($limit: Int!, $after: String, $before: String, $orgId: String, $description: String, $activeStates: [Boolean]) {
    challenges(
      limit: $limit,
      after: $after,
      before: $before,
      where: {
        description_contains: $description,
        orgId: $orgId,
        isActive_in: $activeStates{custom_filter}
      }
    ) {
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
  activeStates?: boolean[],
): Promise<ChallengeData> {
  let custom_filter = ``;
  if (!activeStates || !activeStates.includes(false)) {
    const epoch = Math.floor(new Date().getTime() / 1000).toString();
    custom_filter = `, endTime_gte: "${epoch}", startTime_lte: "${epoch}"`;
  }
  const query = GET_CHALLENGES_QUERY.replaceAll("{custom_filter}", custom_filter);
  return executeQuery<ChallengeData>(client, query, {
    limit,
    after,
    before,
    orgId,
    description,
    activeStates,
  });
}
