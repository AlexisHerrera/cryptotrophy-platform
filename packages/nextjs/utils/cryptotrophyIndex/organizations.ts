const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";

// Define the TypeScript types for organization data.
export type Organization = {
  id: string;
  name: string;
  token: string;
  baseURI: string;
};

export interface PageInfo {
  endCursor: string;
  startCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OrganizationsData {
  organizations: {
    totalCount: number;
    items: Organization[];
    pageInfo: PageInfo;
  };
}

// GraphQL query to fetch organizations with pagination.
const GET_ORGANIZATIONS_QUERY = `
  query GetOrganizations($limit: Int!, $after: String, $before: String) {
    organizations(limit: $limit, after: $after, before: $before) {
      totalCount
      items {
        id
        name
        token
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

// Helper function to fetch organizations from the GraphQL API.
export async function fetchOrganizations(
  limit: number,
  after?: string | null,
  before?: string | null,
): Promise<OrganizationsData> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_ORGANIZATIONS_QUERY,
      variables: { limit, after, before },
    }),
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((err: any) => err.message).join(", "));
  }
  return json.data;
}
