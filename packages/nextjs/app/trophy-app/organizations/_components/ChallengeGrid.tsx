import { ChallengeCard } from "./ChallengeCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { fetchChallenges } from "~~/utils/cryptotrophyIndex/challenges";

export const ChallengeGrid: React.FC<{ orgId: string }> = ({ orgId }) => {
  const fetchData = async (pageSize: number, after?: string | null, before?: string | null, search?: string) => {
    const result = await fetchChallenges(pageSize, after, before, orgId, search);
    return {
      items: result.challenges.items,
      totalCount: result.challenges.totalCount,
      pageInfo: result.challenges.pageInfo,
    };
  };
  return (
    <div>
      <PaginatedGrid fetchData={fetchData} CardComponent={ChallengeCard} pageSize={2} title="Challenges" />
    </div>
  );
};
