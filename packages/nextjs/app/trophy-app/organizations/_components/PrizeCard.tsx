import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ReactMarkdown from "react-markdown";
import { useAccount } from "wagmi";
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
  const [showFull, setShowFull] = useState(false);
  const { isConnected } = useAccount();
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
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
      <div
        className="relative h-32 overflow-hidden rounded-md group/desc cursor-pointer mb-4"
        onClick={() => setShowFull(true)}
      >
        {/* ▼ 1 · Clamped preview */}
        <div className="text-gray-600 dark:text-gray-300 text-sm line-clamp-5 pointer-events-none">
          <ReactMarkdown>{descriptionState}</ReactMarkdown>
        </div>

        {/* ▼ 2 · Hover call-out */}
        <div
          className="
              absolute inset-0 flex items-center justify-center
              bg-black/60 text-white text-xs font-medium
              opacity-0 transition-opacity duration-150 ease-out
              pointer-events-none   /* let clicks reach wrapper */
              group-hover/desc:opacity-100"
        >
          Click to see full description
        </div>
      </div>

      {isConnected ? (
        <button
          onClick={() => onClaimClick(prize)}
          disabled={prize.stock <= 0n}
          className={`mt-auto px-4 py-2 rounded text-white ${prize.stock <= 0n ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          Claim
        </button>
      ) : (
        <span
          className="mt-auto inline-block px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-400 italic cursor-not-allowed pointer-events-none text-center"
          aria-disabled="true"
        >
          Connect your wallet to claim
        </span>
      )}

      {/* ──────────── FULL DESCRIPTION MODAL (portal-style) ──────────── */}
      {showFull && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowFull(false)} />

          {/* Modal panel */}
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg
                       w-[90%] max-w-xl max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()} /* prevent backdrop close */
          >
            {/* Close button */}
            <button
              onClick={() => setShowFull(false)}
              aria-label="Close"
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600
                         dark:hover:text-gray-300 text-2xl leading-none"
            >
              &times;
            </button>

            <h4 className="text-lg font-semibold mb-4">Prize&nbsp;#{prize.name}</h4>

            <div className="prose dark:prose-invert prose-sm">
              <ReactMarkdown>{descriptionState}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
