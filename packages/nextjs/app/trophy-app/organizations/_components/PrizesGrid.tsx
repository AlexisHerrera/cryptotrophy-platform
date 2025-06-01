import React, { useState } from "react";
import { ClaimPrizePanel } from "./ClaimPrizePanel";
import { PaginatedGrid } from "./PaginatedGrid";
import { PrizeCard } from "./PrizeCard";
import { usePrizes } from "~~/hooks/cryptotrophyIndex/usePrizes";
import { Prize } from "~~/utils/cryptotrophyIndex/types";

export const PrizesGrid: React.FC<{ orgId: string }> = ({ orgId }) => {
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);

  const { data, isLoading } = usePrizes(orgId, 6, afterCursor, beforeCursor, searchTerm);

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
    <div>
      <PaginatedGrid
        data={{
          items: data?.prizes.items || [],
          totalCount: data?.prizes.totalCount || 0,
          pageInfo: data?.prizes.pageInfo || null,
        }}
        renderCard={(item, index) => (
          <PrizeCard key={index} item={item} onClaimClick={prize => setSelectedPrize(prize)} />
        )}
        pageSize={6}
        title="Prizes"
        loading={isLoading}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
      />

      {selectedPrize && <ClaimPrizePanel prize={selectedPrize} onClose={() => setSelectedPrize(null)} />}
    </div>
  );
};
