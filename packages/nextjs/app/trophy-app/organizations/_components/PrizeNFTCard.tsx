import React from "react";

interface PrizeNFTCardProps {
  prizeName: string;
  symbol: string;
  tokenId: number;
  balance?: number;
  imagePath?: string;
}

export const PrizeNFTCard = ({
  prizeName,
  symbol,
  tokenId,
  balance,
  imagePath,
}: {
  prizeName: string;
  symbol: string;
  tokenId: number;
  balance?: number;
  imagePath?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col hover:shadow-lg transition-shadow duration-200 w-full h-full">
    <div className="relative mb-4">
      {balance && balance > 1 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-block bg-blue-600 dark:bg-blue-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow">
            x{balance}
          </div>
        </div>
      )}
      {imagePath ? (
        <div className="w-full aspect-[4/3] relative">
          <img
            src={imagePath}
            alt={`Prize ${prizeName}`}
            className="absolute inset-0 w-full h-full object-cover rounded-md"
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-prize.svg";
            }}
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
          No Image
        </div>
      )}
    </div>
    <div className="flex flex-col flex-1">
      <h2 className="text-xl font-semibold dark:text-white mb-2">{prizeName}</h2>
      <div className="mb-3">
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded font-mono tracking-wide">
          {symbol} {tokenId >= 0 ? `#${tokenId}` : ""}
        </span>
      </div>
      <p className="text-base text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
        This NFT represents ownership of the prize: <span className="font-semibold">{prizeName}</span>
      </p>
    </div>
  </div>
);
