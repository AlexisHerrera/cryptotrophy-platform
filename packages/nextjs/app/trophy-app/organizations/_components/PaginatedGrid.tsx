import React, { useState } from "react";

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  pageInfo: PageInfo | null;
}

interface PaginatedGridProps<T> {
  data: PaginatedData<T>;
  CardComponent: React.ComponentType<{ item: T }>;
  pageSize?: number;
  title?: string;
  loading?: boolean;
  onPageChange?: (after: string | null, before: string | null, search: string) => void;
  onSearch?: (searchTerm: string) => void;
}

export const PaginatedGrid = <T,>({
  data,
  CardComponent,
  pageSize = 4,
  title = "Items",
  loading = false,
  onPageChange,
  onSearch,
}: PaginatedGridProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const totalPages = Math.ceil(data.totalCount / pageSize);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{title}</h1>

      <div className="flex mb-4 space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch?.(searchTerm)}
          className="p-2 border rounded w-full dark:bg-gray-700 dark:text-white"
          placeholder="Search by name..."
        />
        <button
          onClick={() => onSearch?.(searchTerm)}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded"
        >
          Search
        </button>
      </div>

      {loading && <p className="dark:text-gray-300">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.items.map((item, index) => (
          <CardComponent key={index} item={item} />
        ))}
      </div>

      <div className="flex justify-center items-center mt-6 space-x-4">
        <button
          onClick={() => onPageChange?.(null, data.pageInfo?.startCursor || null, searchTerm)}
          disabled={!data.pageInfo?.hasPreviousPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="dark:text-white">Total: {data.totalCount} items</span>
        <button
          onClick={() => onPageChange?.(data.pageInfo?.endCursor || null, null, searchTerm)}
          disabled={!data.pageInfo?.hasNextPage}
          className="px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
