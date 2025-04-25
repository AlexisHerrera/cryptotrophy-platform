import { OrganizationCard } from "./OrganizationCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { fetchOrganizations } from "~~/utils/cryptotrophyIndex/organizations";

const fetchData = async (pageSize: number, after?: string | null, before?: string | null, search?: string) => {
  const result = await fetchOrganizations(pageSize, after, before, search);
  return {
    items: result.organizations.items,
    totalCount: result.organizations.totalCount,
    pageInfo: result.organizations.pageInfo,
  };
};

export const OrganizationsGrid = () => {
  return <PaginatedGrid fetchData={fetchData} CardComponent={OrganizationCard} pageSize={2} title="Organizations" />;
};
