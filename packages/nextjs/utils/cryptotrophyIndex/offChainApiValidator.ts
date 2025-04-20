const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";

// Define the TypeScript types for organization data.
export type OffchainApiCall = {
  validationId: string;
  claimer: string;
  requestId: string;
};

export interface OffchainApiCallsData {
  offchainApiCalls: {
    items: OffchainApiCall[];
  };
}

// GraphQL query to fetch organizations with pagination.
const GET_LATEST_VALIDATOR_CALL_QUERY = `
  query GetLatestValidatorCall {
    offchainApiCalls(limit: 1, orderBy: "requestId", orderDirection: "DESC") {
      items {
        validationId
        claimer
        requestId
      }
    }
  }
`;

// Helper function to fetch organizations from the GraphQL API.
export async function fetchLatestOffChainApiRequestId(): Promise<string | null> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_LATEST_VALIDATOR_CALL_QUERY,
    }),
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors.map((err: any) => err.message).join(", "));
  }

  const items = json.data?.offchainApiCalls?.items;
  return items?.length ? items[0].requestId : null;
}
