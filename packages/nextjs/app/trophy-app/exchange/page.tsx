"use client";

import React, { useState } from "react";
import { TokenRowProps } from "./_components/TokenRow";
import { TokenTable } from "./_components/TokenTable";
import { ethers } from "ethers";
import { useAccount, useReadContracts } from "wagmi";
import { ExchangeModal, TokenData } from "~~/app/trophy-app/exchange/_components/ExchangeModal";
import { BackButton } from "~~/components/common/BackButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const ExchangePage = () => {
  const { address } = useAccount();
  // tokenData is only used to show ExchangeModal
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const { data: organizationsData, isLoading: orgLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "listOrganizationsWithDetails",
  });
  const userAddress = address || ethers.ZeroAddress;
  const { targetNetwork } = useTargetNetwork();
  const { data: tokenContract } = useDeployedContractInfo("OrganizationToken");

  const {
    data: balancesData,
    isLoading: balancesLoading,
    refetch: refetchBalances,
  } = useReadContracts({
    contracts: organizationsData
      ? organizationsData[3].map(tokenAddress => ({
          address: tokenAddress as `0x${string}`,
          abi: tokenContract?.abi,
          functionName: "balanceOf",
          args: [userAddress],
          chainId: targetNetwork.id,
        }))
      : [],
    query: {
      enabled: !!organizationsData && !!tokenContract,
      select: data => data.map(d => (d.status === "success" ? (d.result as bigint) : 0n)),
    },
  });

  if (orgLoading || !organizationsData || (balancesLoading && !balancesData)) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  const [, , tokenSymbols, tokenAddresses] = organizationsData;

  const combinedTokenData: TokenRowProps[] = tokenAddresses.map((tokenAddress, index) => ({
    tokenAddress,
    tokenSymbol: tokenSymbols[index],
    balance: balancesData ? balancesData[index] : 0n,
    setModalData: setTokenData,
  }));

  return (
    <div>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl p-4">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-2">
              Organization Tokens Exchange
            </h1>
            <div className="mx-auto w-16 h-1 bg-blue-500 rounded-full mb-4"></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mb-6">
            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">Account:</span>
            {address ? (
              <span className="text-sm font-mono px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shadow">
                {address}
              </span>
            ) : (
              <span className="text-sm italic text-gray-500 dark:text-gray-400">Please connect a wallet</span>
            )}
          </div>
          {/* Back button */}
          <div className="flex justify-center mb-4">
            <BackButton />
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 max-w-4xl">
        <TokenTable tokens={combinedTokenData} />
      </div>
      {tokenData !== null && (
        <ExchangeModal
          tokenData={tokenData}
          onClose={() => setTokenData(null)}
          onSuccess={() => {
            refetchBalances();
            setTokenData(null);
          }}
        />
      )}
    </div>
  );
};

export default ExchangePage;
