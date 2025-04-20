const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";

// Define the TypeScript types for organization data.
export type RandomValidatorCall = {
  validationId: string;
  claimer: string;
  requestId: string;
};

export interface RandomValidatorCallsData {
  offchainApiCalls: {
    items: RandomValidatorCall[];
  };
}

// GraphQL query to fetch organizations with pagination.
const GET_LATEST_VALIDATOR_CALL_QUERY = `
  query GetLatestValidatorCall {
    randomValidatorCalls(limit: 1, orderBy: "requestId", orderDirection: "DESC") {
      items {
        validationId
        claimer
        requestId
      }
    }
  }
`;

// Helper function to fetch organizations from the GraphQL API.
export async function fetchLatestRandomValidatorRequestId(): Promise<string | null> {
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

  const items = json.data?.randomValidatorCalls?.items;
  console.log("=============", items[0].requestId);
  return items?.length ? items[0].requestId : null;
}
