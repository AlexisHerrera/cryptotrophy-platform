import { executeQuery } from "./indexClient";
import type { ChallengeClaimData } from "./types";
import type { GraphQLClient } from "graphql-request";

export const GET_CHALLENGE_CLAIMS_QUERY = `
  query GetRewardClaims($user: String, $challenges: [String!]!) {
    rewardClaims(where: { user: $user, challengeId_in: $challenges }) {
      totalCount
      items {
        challengeId
        claimTime
      }
    }
  }
`;

export async function fetchChallengeClaims(
  client: GraphQLClient,
  user: string,
  challenges: string[],
): Promise<ChallengeClaimData> {
  return executeQuery<ChallengeClaimData>(client, GET_CHALLENGE_CLAIMS_QUERY, {
    user,
    challenges,
  });
}
