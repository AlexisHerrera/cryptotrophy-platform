const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";

// Define the TypeScript types for organization data.
export type Challenge = {
  id: string;
  description: string;
  startTime: bigint;
  endTime: bigint;
  maxWinners: number;
  prizeAmount: bigint;
  orgId: string;
  validatorUID?: string;
  active: boolean;
};

export interface PageInfo {
  endCursor: string;
  startCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ChallengeData {
  challenges: {
    totalCount: number;
    items: Challenge[];
    pageInfo: PageInfo;
  };
}

// GraphQL query to fetch challenges with pagination.
const GET_CHALLENGE_QUERY = `
  query GetChallenges($limit: Int!, $after: String, $before: String, $orgId: String, $description: String) {
    challenges(limit: $limit, after: $after, before: $before, where: {description_contains: $description, orgId: $orgId}) {
        totalCount
        items {
            id
            description
            startTime
            endTime
            maxWinners
            orgId
            prizeAmount
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

// Helper function to fetch challenges from the GraphQL API.
export async function fetchChallenges(
  limit: number,
  after?: string | null,
  before?: string | null,
  orgId?: string,
  description?: string,
): Promise<ChallengeData> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_CHALLENGE_QUERY,
      variables: { limit, after, before, orgId, description },
    }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((err: any) => err.message).join(", "));
  }
  return json.data;
}
