import React, { useEffect, useState } from "react";
import { Prize } from "~~/utils/cryptotrophyIndex/types";
import { loadMetadata } from "~~/utils/loadMetadata";

type PrizeMetadata = {
  logo?: string;
  name?: string;
  description?: string;
};

// A card component for displaying an individual prize's data.
// It fetches additional metadata (logo and description) from IPFS.
export const PrizeCard: React.FC<{ item: Prize; onClaimClick: (prize: Prize) => void }> = ({
  item: prize,
  onClaimClick,
}) => {
  const [metadata, setMetadata] = useState<{ logo?: string; name?: string; description?: string }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (prize.baseURI) {
        setLoading(true);
        try {
          const data = await loadMetadata<PrizeMetadata>(prize.baseURI, {
            allowImageOnly: true,
            defaultField: "logo",
          });
          setMetadata(data);
        } catch (error) {
          console.error("Error fetching IPFS metadata:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMetadata();
  }, [prize.baseURI]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition-shadow duration-200">
      {metadata.logo ? (
        <div className="w-full aspect-[4/3] relative mb-4">
          <img
            src={metadata.logo}
            alt={prize.name}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {loading ? "Loading logo..." : "No logo available"}
        </div>
      )}
      <h2 className="text-xl font-semibold dark:text-white">{prize.name}</h2>
      {metadata.description && <p className="text-gray-800 dark:text-gray-200 mt-2">{metadata.description}</p>}
      <p className="text-gray-600 dark:text-gray-300">Stock: {prize.stock}</p>
      <button
        onClick={() => onClaimClick(prize)}
        disabled={prize.stock <= 0n}
        className={`mt-4 px-4 py-2 rounded text-white ${prize.stock <= 0n ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        Claim
      </button>
    </div>
  );
};
