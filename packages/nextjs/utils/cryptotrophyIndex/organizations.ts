import { executeQuery } from "./indexClient";
import type { OrganizationData } from "./types";
import type { GraphQLClient } from "graphql-request";

const GET_ORGANIZATIONS_QUERY = `
query GetOrganizations($limit: Int!, $after: String, $before: String, $name: String) {
  organizations(
    limit: $limit,
    after: $after,
    before: $before,
    where: {
      name_contains: $name
    }
  ) {
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

export async function fetchOrganizations(
  client: GraphQLClient,
  limit: number,
  after?: string | null,
  before?: string | null,
  name?: string,
): Promise<OrganizationData> {
  return executeQuery<OrganizationData>(client, GET_ORGANIZATIONS_QUERY, {
    limit,
    after,
    before,
    name,
  });
}
