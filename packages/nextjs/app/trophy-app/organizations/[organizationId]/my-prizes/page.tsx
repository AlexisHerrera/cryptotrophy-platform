"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PrizeNFTCard } from "../../_components/PrizeNFTCard";
import { useAccount } from "wagmi";
import { useEthersSigner } from "~~/hooks/ethers/useEthersSigner";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { getPrizeNFTContract } from "~~/utils/scaffold-eth/contract";

// ERC721Enumerable interface ID
const ERC721_ENUMERABLE_INTERFACE_ID = "0x780e9d63";

interface NFTItem {
  id: string;
  tokenId: number;
  prizeId: number;
  name: string;
  prizeName: string;
  symbol: string;
  contractAddress: string;
  balance?: number;
  imagePath?: string;
}

const MyPrizesPage: React.FC = () => {
  const { organizationId } = useParams() as { organizationId: string };
  const { address } = useAccount();
  const signer = useEthersSigner();
  const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  // Get deployed contract information
  const { data: prizesContractData } = useDeployedContractInfo("Prizes");

  // Get list of prizes and their NFT contracts
  const { data: prizesData, isLoading: isPrizesLoading } = useScaffoldReadContract({
    contractName: "Prizes",
    functionName: "listPrizes",
    args: [BigInt(organizationId)],
  });

  // Get organization details
  const { data: organizationData, isLoading: isOrgLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "getOrganizationDetails",
    args: [BigInt(organizationId)],
  });

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!address || !signer || !prizesData || isPrizesLoading || !prizesContractData) return;

      try {
        setIsLoadingNFTs(true);
        const nfts: NFTItem[] = [];

        // Extract prize data safely using optional chaining and type assertion
        const prizesResult = prizesData as unknown as [
          bigint[],
          string[],
          string[],
          bigint[],
          bigint[],
          string[],
          string[],
        ];
        const ids = prizesResult[0] || [];
        const names = prizesResult[1] || [];
        // const descriptions = prizesResult[2] || [];
        // const prices = prizesResult[3] || [];
        // const stocks = prizesResult[4] || [];
        const nftContracts = prizesResult[5] || [];
        const imagePaths = prizesResult[6] || [];

        // For each prize, check if user owns any NFTs
        for (let i = 0; i < ids.length; i++) {
          const prizeId = ids[i];
          const prizeName = names[i];
          const contractAddress = nftContracts[i];
          const imagePath = imagePaths[i];

          try {
            // Get NFT contract instance using the Prize NFT ABI from artifacts
            const nftContract = getPrizeNFTContract({
              contractAddress,
              signer,
            });

            // Get user's balance
            const balance = await nftContract.balanceOf(address);

            if (balance > 0n) {
              // Get NFT metadata
              const nftName = await nftContract.name();
              const nftSymbol = await nftContract.symbol();

              // Check if contract supports ERC721Enumerable
              try {
                const supportsEnumerable = await nftContract.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID);

                if (supportsEnumerable) {
                  // Use enumerable method to get all tokens
                  for (let j = 0; j < balance; j++) {
                    const tokenId = await nftContract.tokenOfOwnerByIndex(address, j);

                    nfts.push({
                      id: `${contractAddress}-${tokenId}`,
                      tokenId: Number(tokenId),
                      prizeId: Number(prizeId),
                      name: nftName,
                      prizeName,
                      symbol: nftSymbol,
                      contractAddress,
                      balance: Number(balance),
                      imagePath,
                    });
                  }
                } else {
                  // Fallback implementation - add a placeholder NFT
                  nfts.push({
                    id: `${contractAddress}-placeholder`,
                    tokenId: -1,
                    prizeId: Number(prizeId),
                    name: nftName,
                    prizeName,
                    symbol: nftSymbol,
                    contractAddress,
                    balance: Number(balance),
                    imagePath,
                  });
                }
              } catch (error) {
                console.error("Error checking interface support:", error);
                // Fallback implementation - add a placeholder NFT
                nfts.push({
                  id: `${contractAddress}-placeholder`,
                  tokenId: -1,
                  prizeId: Number(prizeId),
                  name: nftName,
                  prizeName,
                  symbol: nftSymbol,
                  contractAddress,
                  balance: Number(balance),
                  imagePath,
                });
              }
            }
          } catch (error) {
            console.error(`Error processing NFT contract ${contractAddress}:`, error);
            notification.error(`Error processing prize NFT: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        setUserNFTs(nfts);
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
        notification.error("Failed to fetch your NFTs. Please try again.");
      } finally {
        setIsLoadingNFTs(false);
      }
    };

    fetchUserNFTs();
  }, [address, signer, prizesData, isPrizesLoading, organizationId, prizesContractData]);

  // Get organization name from data
  const orgName = organizationData ? (organizationData[1] as string) : "";

  if (isPrizesLoading || isOrgLoading || isLoadingNFTs) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-gray-50 dark:from-gray-900 to-white dark:to-gray-950 py-4">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-2">
              My Prize NFTs
            </h1>
            <div className="mx-auto w-16 h-1 bg-blue-500 rounded-full mb-4"></div>

            {orgName && (
              <div className="flex justify-center items-center gap-2 mb-6">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Organization:</span>
                <span className="text-xl font-mono px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shadow">
                  {orgName}
                </span>
              </div>
            )}
          </div>

          {/* Back button */}
          <div className="flex justify-center mb-4">
            <Link
              href={`/trophy-app/organizations/${organizationId}/prizes`}
              className="inline-block px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              Back to Prize Center
            </Link>
          </div>

          {/* Content */}
          {userNFTs.length === 0 ? (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-xl">You haven&apos;t collected any prize NFTs yet.</p>
              <p className="mt-2">Head over to the Prize Center to claim some prizes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {userNFTs.map(nft => (
                <PrizeNFTCard
                  key={nft.id}
                  prizeName={nft.prizeName}
                  symbol={nft.symbol}
                  tokenId={nft.tokenId}
                  balance={nft.balance}
                  imagePath={nft.imagePath}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPrizesPage;
