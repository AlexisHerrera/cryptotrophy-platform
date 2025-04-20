import React, { useEffect, useState } from "react";
import { OrganizationCard } from "./OrganizationCard";
import { Organization, PageInfo, fetchOrganizations } from "~~/utils/cryptotrophyIndex/organizations";

const PAGE_SIZE = 2;

// The main component for displaying the organizations grid with pagination.
export const OrganizationsGrid: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Pagination state
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);

  // Fetch organizations whenever the currentPage changes.
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchOrganizations(PAGE_SIZE, afterCursor, beforeCursor);
        setOrganizations(data.organizations.items);
        setTotalCount(data.organizations.totalCount);
        setPageInfo(data.organizations.pageInfo);
      } catch (err: any) {
        setError(err.message || "Error fetching organizations.");
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [afterCursor, beforeCursor]);

  const handleNext = () => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      setBeforeCursor(null); // Clear opposite direction
      setAfterCursor(pageInfo.endCursor);
    }
  };

  const handlePrevious = () => {
    if (pageInfo?.hasPreviousPage && pageInfo.startCursor) {
      setAfterCursor(null); // Clear opposite direction
      setBeforeCursor(pageInfo.startCursor);
    }
  };

  const currentPage = Math.ceil((organizations[0]?.id ? parseInt(organizations[0].id) : 0) / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Organizations</h1>

      {loading && <p className="dark:text-gray-300">Loading organizations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {organizations.map(org => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={handlePrevious}
          disabled={!pageInfo?.hasPreviousPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="dark:text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={!pageInfo?.hasNextPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
