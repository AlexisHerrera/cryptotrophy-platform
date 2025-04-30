import { OrganizationCard } from "./OrganizationCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { createIndexClient } from "~~/utils/cryptotrophyIndex/indexClient";
import { fetchOrganizations } from "~~/utils/cryptotrophyIndex/organizations";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";
const client = createIndexClient(GRAPHQL_ENDPOINT);

const fetchData = async (pageSize: number, after?: string | null, before?: string | null, search?: string) => {
  const result = await fetchOrganizations(client, pageSize, after, before, search);
  return {
    items: result.organizations.items,
    totalCount: result.organizations.totalCount,
    pageInfo: result.organizations.pageInfo,
  };
};

export const OrganizationsGrid = () => {
  return <PaginatedGrid fetchData={fetchData} CardComponent={OrganizationCard} pageSize={2} title="Organizations" />;
};
