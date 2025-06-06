import React, { useState } from "react";
import { ChallengeCard } from "./ChallengeCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { useChallenges } from "~~/hooks/cryptotrophyIndex/useChallenges";

export const ChallengeGrid: React.FC<{ orgId: string }> = ({ orgId }) => {
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showClosedChallenges, setShowClosedChallenges] = useState(false);
  const [gridPageSize, setGridPageSize] = useState<number>(6);

  const { data, isLoading } = useChallenges(
    orgId,
    gridPageSize,
    afterCursor,
    beforeCursor,
    searchTerm,
    showClosedChallenges ? [true, false] : [true],
  );

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

  const handleShowClosedChallenges = (checked: boolean) => {
    setShowClosedChallenges(checked);
    setAfterCursor(null);
    setBeforeCursor(null);
  };

  return (
    <div>
      <div className="px-8 mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-y-2">
          {/* Title */}
          <h1 className="text-2xl font-bold dark:text-white">Challenges</h1>
          {/* Controls */}
          <div className="flex items-center gap-x-4">
            <label className="flex items-center gap-x-2 opacity-70">
              <span className="text-xs text-gray-500 dark:text-gray-400">Show closed</span>
              <input
                type="checkbox"
                checked={showClosedChallenges}
                onChange={e => handleShowClosedChallenges(e.target.checked)}
                className="toggle toggle-primary"
                aria-label="Show closed challenges"
              />
            </label>
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
          items: data?.challenges.items || [],
          totalCount: data?.challenges.totalCount || 0,
          pageInfo: data?.challenges.pageInfo || null,
        }}
        renderCard={(item, index) => <ChallengeCard key={index} item={item} />}
        pageSize={gridPageSize}
        loading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />
    </div>
  );
};
