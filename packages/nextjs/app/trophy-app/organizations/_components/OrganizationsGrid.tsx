import React, { useState } from "react";
import { OrganizationCard } from "./OrganizationCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { useOrganizations } from "~~/hooks/cryptotrophyIndex/useOrganizations";

export const OrganizationsGrid = () => {
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading } = useOrganizations(4, afterCursor, beforeCursor, searchTerm);

  const handlePageChange = (after: string | null, before: string | null) => {
    setAfterCursor(after);
    setBeforeCursor(before);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  return (
    <PaginatedGrid
      data={{
        items: data?.organizations.items || [],
        totalCount: data?.organizations.totalCount || 0,
        pageInfo: data?.organizations.pageInfo || null,
      }}
      renderCard={(item, index) => <OrganizationCard key={index} item={item} />}
      pageSize={4}
      title="Organizations"
      loading={isLoading}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
    />
  );
};
