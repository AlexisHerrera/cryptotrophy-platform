import React, { useEffect, useState } from "react";

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  pageInfo: PageInfo;
}

interface PaginatedGridProps<T> {
  fetchData: (
    pageSize: number,
    after?: string | null,
    before?: string | null,
    searchTerm?: string,
  ) => Promise<PaginatedData<T>>;
  CardComponent: React.ComponentType<{ item: T }>;
  pageSize?: number;
  title?: string;
}

export const PaginatedGrid = <T,>({
  fetchData,
  CardComponent,
  pageSize = 4,
  title = "Items",
}: PaginatedGridProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search params
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingSearch, setPendingSearch] = useState<string>("");

  // Pagination state
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchData(pageSize, afterCursor, beforeCursor, searchTerm);
      setItems(data.items);
      setPageInfo(data.pageInfo);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [afterCursor, beforeCursor, searchTerm]);

  const handleSearch = () => {
    setAfterCursor(null);
    setBeforeCursor(null);
    setCurrentPage(1);
    setSearchTerm(pendingSearch);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{title}</h1>

      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          value={pendingSearch}
          onChange={e => setPendingSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
          placeholder="Search by name..."
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded">
          Search
        </button>
      </div>

      {loading && <p className="dark:text-gray-300">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <CardComponent key={index} item={item} />
        ))}
      </div>

      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => {
            setAfterCursor(null);
            setCurrentPage(currentPage - 1);
            setBeforeCursor(pageInfo?.startCursor ?? null);
          }}
          disabled={!pageInfo?.hasPreviousPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="dark:text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => {
            setBeforeCursor(null);
            setCurrentPage(currentPage + 1);
            setAfterCursor(pageInfo?.endCursor ?? null);
          }}
          disabled={!pageInfo?.hasNextPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
