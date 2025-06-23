import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ReactMarkdown from "react-markdown";
import { DECIMALS_TOKEN } from "~~/settings";
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
  const [descriptionState, setDescription] = useState<string>(prize.description);
  const [priceState, setPrice] = useState<string>(ethers.formatUnits(prize.price ? prize.price : 0n, DECIMALS_TOKEN));

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
          if (metadata.description) {
            setDescription(metadata.description);
          }
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

      {/* ───────────── Name ───────────── */}
      <h2 className="text-xl font-semibold dark:text-white">{prize.name}</h2>

      {/* ───────────── Chip-tray: stock + price ───────────── */}
      <div className="mt-1 flex gap-2 flex-wrap">
        <span className={`badge ${prize.stock > 0n ? "badge-success" : "badge-error"}`}>
          {prize.stock > 0n ? `${prize.stock} left` : "Out of stock"}
        </span>

        <span className="badge badge-outline">{priceState} tokens</span>
      </div>

      {/* Description */}
      <div className="relative mb-4 max-h-32 overflow-hidden group-hover:max-h-none">
        {/* Normal text */}
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          <ReactMarkdown>{descriptionState}</ReactMarkdown>
        </div>

        {/* On hover, full text absolutely positioned */}
        <div className="absolute inset-0 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md hidden group-hover:flex flex-col justify-center z-10">
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            <ReactMarkdown>{descriptionState}</ReactMarkdown>
          </div>
        </div>
      </div>

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
