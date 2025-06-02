import React, { useState } from "react";
import { OrganizationCard } from "./OrganizationCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { useOrganizations } from "~~/hooks/cryptotrophyIndex/useOrganizations";

export const OrganizationsGrid = () => {
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [gridPageSize, setGridPageSize] = useState<number>(6);

  const { data, isLoading } = useOrganizations(gridPageSize, afterCursor, beforeCursor, searchTerm);

  const handlePageChange = (after: string | null, before: string | null) => {
    setAfterCursor(after);
    setBeforeCursor(before);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  const handlePageSizeChange = (size: number) => {
    setGridPageSize(size);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  return (
    <div>
      <div className="px-8 mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-y-2">
          {/* Title */}
          <h1 className="text-2xl font-bold dark:text-white">Organizations</h1>
          {/* Controls */}
          <div className="flex items-center gap-x-4">
            <label className="flex items-center gap-x-1">
              <span className="text-sm text-gray-600 dark:text-gray-300">Page size</span>
              <select
                className="select select-sm select-bordered"
                value={gridPageSize}
                onChange={e => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={18}>18</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <PaginatedGrid
        data={{
          items: data?.organizations.items || [],
          totalCount: data?.organizations.totalCount || 0,
          pageInfo: data?.organizations.pageInfo || null,
        }}
        renderCard={(item, index) => <OrganizationCard key={index} item={item} />}
        pageSize={gridPageSize}
        loading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
};
