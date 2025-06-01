import React, { useState } from "react";
import { ChallengeCard } from "./ChallengeCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { useChallenges } from "~~/hooks/cryptotrophyIndex/useChallenges";

export const ChallengeGrid: React.FC<{ orgId: string }> = ({ orgId }) => {
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data, isLoading } = useChallenges(orgId, 6, afterCursor, beforeCursor, searchTerm);

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
        items: data?.challenges.items || [],
        totalCount: data?.challenges.totalCount || 0,
        pageInfo: data?.challenges.pageInfo || null,
      }}
      renderCard={(item, index) => <ChallengeCard key={index} item={item} />}
      pageSize={6}
      title="Challenges"
      loading={isLoading}
      onPageChange={handlePageChange}
      onSearch={handleSearch}
    />
  );
};
