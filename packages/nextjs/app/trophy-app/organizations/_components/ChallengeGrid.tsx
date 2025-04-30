import { ChallengeCard } from "./ChallengeCard";
import { PaginatedGrid } from "./PaginatedGrid";
import { fetchChallenges } from "~~/utils/cryptotrophyIndex/challenges";
import { createIndexClient } from "~~/utils/cryptotrophyIndex/indexClient";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:42069";
const client = createIndexClient(GRAPHQL_ENDPOINT);

export const ChallengeGrid: React.FC<{ orgId: string }> = ({ orgId }) => {
  const fetchData = async (pageSize: number, after?: string | null, before?: string | null, search?: string) => {
    const result = await fetchChallenges(client, pageSize, after, before, orgId, search);
    return {
      items: result.challenges.items,
      totalCount: result.challenges.totalCount,
      pageInfo: result.challenges.pageInfo,
    };
  };
  return <PaginatedGrid fetchData={fetchData} CardComponent={ChallengeCard} pageSize={4} title="Challenges" />;
};
