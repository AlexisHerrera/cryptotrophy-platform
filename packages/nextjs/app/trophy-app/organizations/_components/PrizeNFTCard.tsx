import React from "react";
import { erc721Abi } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

type Props = {
  prizeName: string;
  symbol: string;
  tokenId: number;
  balance?: number;
  imagePath?: string;
  contractAddress?: string;
};

export const PrizeNFTCard = ({ prizeName, symbol, tokenId, balance, imagePath, contractAddress }: Props) => {
  /* ------------------------------------------------------------------ */
  /*  hooks & helpers                                                    */
  /* ------------------------------------------------------------------ */
  const { address: userAddress } = useAccount();
  const { data: prizesContractData } = useDeployedContractInfo("Prizes");
  const { writeContractAsync, isPending } = useWriteContract();

  /* ------------------------------------------------------------------ */
  /*  actions                                                           */
  /* ------------------------------------------------------------------ */

  const addNFTToMetaMask = async (tokenAddress: `0x${string}`, tokenId: string | number, image?: string) => {
    try {
      if (!window?.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      // MetaMask returns `true` if the user clicks “Add”, `false` if they reject.
      const wasAdded: boolean = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC721", // ← key change
          options: {
            address: tokenAddress,
            tokenId: tokenId.toString(), // MetaMask expects a string
            image: image ?? "", // optional; omit `decimals` for NFTs
          },
        },
      });

      if (wasAdded) {
        alert("NFT added to MetaMask!");
      } else {
        alert("NFT import was cancelled.");
      }
    } catch (err) {
      console.error("Error adding NFT to MetaMask:", err);
      alert("Failed to add NFT to MetaMask");
    }
  };

  const returnNFT = async () => {
    try {
      if (!userAddress) {
        alert("Connect your wallet first.");
        return;
      }
      if (!contractAddress) {
        alert("PrizeNFT contract not found.");
        return;
      }
      if (!prizesContractData?.address) {
        alert("Destination address not found.");
        return;
      }
      await writeContractAsync({
        abi: erc721Abi,
        address: contractAddress as `0x${string}`,
        functionName: "transferFrom",
        args: [
          userAddress,
          prizesContractData.address,
          BigInt(tokenId), // viem expects bigint
        ],
      });

      alert("NFT returned to the organization!");
    } catch (err) {
      console.error(err);
      alert("Failed to return NFT.");
    }
  };

  const handleAddToWallet = async () => {
    console.log("-- contractAddress", contractAddress);
    if (!contractAddress) {
      alert("PrizeNFT contract not found");
      return;
    }
    await addNFTToMetaMask(contractAddress as `0x${string}`, tokenId, imagePath);
  };

  /* ------------------------------------------------------------------ */
  /*  UI                                                                */
  /* ------------------------------------------------------------------ */

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 flex flex-col hover:shadow-lg transition-shadow duration-200 w-full h-full">
      {/* ---------- thumbnail ---------- */}
      <div className="relative mb-4">
        {balance && balance > 1 && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-block bg-blue-600 dark:bg-blue-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow">
              x{balance}
            </span>
          </div>
        )}

        {imagePath ? (
          <div className="w-full aspect-[4/3] relative">
            <img
              src={imagePath}
              alt={`Prize ${prizeName}`}
              className="absolute inset-0 w-full h-full object-cover rounded-md"
              onError={e => {
                (e.target as HTMLImageElement).src = "/placeholder-prize.svg";
              }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400">
            No Image
          </div>
        )}
      </div>

      {/* ---------- body ---------- */}
      <div className="flex flex-col flex-1">
        <h2 className="text-xl font-semibold dark:text-white mb-2">{prizeName}</h2>

        <div className="mb-3">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded font-mono tracking-wide">
            {symbol} #{tokenId}
          </span>
        </div>

        <p className="text-base text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
          This NFT represents ownership of the prize: <span className="font-semibold">{prizeName}</span>
        </p>
      </div>

      {/* ---------- actions ---------- */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={returnNFT}
          disabled={isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
        >
          {isPending ? "Returning..." : "Use NFT"}
        </button>

        <button
          onClick={handleAddToWallet}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
        >
          Add to Wallet
        </button>
      </div>
    </div>
  );
};
