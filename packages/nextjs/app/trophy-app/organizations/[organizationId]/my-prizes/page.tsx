"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { BackButton } from "~~/components/common/BackButton";
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

        // Extract prize data
        const [ids, names, , , , nftContracts] = prizesData;

        // For each prize, check if user owns any NFTs
        for (let i = 0; i < ids.length; i++) {
          const prizeId = ids[i];
          const prizeName = names[i];
          const contractAddress = nftContracts[i];

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
                    });
                  }
                } else {
                  // Fallback implementation - add a placeholder NFT
                  nfts.push({
                    id: `${contractAddress}-placeholder`,
                    tokenId: -1,
                    prizeId: Number(prizeId),
                    name: nftName,
                    prizeName: `${prizeName} (${balance} owned)`,
                    symbol: nftSymbol,
                    contractAddress,
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
                  prizeName: `${prizeName} (${balance} owned)`,
                  symbol: nftSymbol,
                  contractAddress,
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
    <div className="flex justify-between">
      <BackButton />
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-4xl text-gray-700 font-mono grayscale mb-4 dark:text-gray-300 text-center">
          My Prize NFTs {orgName && `- ${orgName}`}
        </h1>

        <div className="text-center mb-6">
          <Link href={`/trophy-app/organizations/${organizationId}/prizes`} className="btn btn-secondary">
            Back to Prize Center
          </Link>
        </div>

        {userNFTs.length === 0 ? (
          <div className="text-center p-8 bg-base-200 rounded-lg">
            <p className="text-xl">You haven&apos;t collected any prize NFTs yet.</p>
            <p className="mt-2">Head over to the Prize Center to claim some prizes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNFTs.map(nft => (
              <div key={nft.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{nft.prizeName}</h2>
                  <div className="badge badge-primary">
                    {nft.symbol} {nft.tokenId >= 0 ? `#${nft.tokenId}` : ""}
                  </div>
                  <p className="mt-2">This NFT represents ownership of the prize: {nft.prizeName}</p>
                  <div className="card-actions justify-end mt-4">
                    {nft.tokenId >= 0 ? (
                      <a
                        href={`https://etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        View on Etherscan
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Multiple NFTs owned</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPrizesPage;
