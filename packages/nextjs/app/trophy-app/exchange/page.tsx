"use client";

import React, { useState } from "react";
import TokenRow from "./TokenRow";
import { ethers } from "ethers";
import { useAccount, useReadContracts } from "wagmi";
import ExchangeModal from "~~/app/trophy-app/exchange/ExchangeModal";
import { BackButton } from "~~/components/common/BackButton";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export interface TokenData {
  tokenAddress: string;
  tokenSymbol: string;
  balance: bigint;
  exchangeRate: bigint;
}

const ExchangePage = () => {
  const { address } = useAccount();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const { data: organizationsData, isLoading: orgLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "listOrganizationsWithDetails",
  });
  const userAddress = address || ethers.ZeroAddress;
  const { targetNetwork } = useTargetNetwork();
  const { data: tokenContract } = useDeployedContractInfo("OrganizationToken");
  const [showOnlyOwned, setShowOnlyOwned] = useState(true);

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

  const combinedTokenData = tokenAddresses.map((tokenAddress, index) => ({
    tokenAddress,
    tokenSymbol: tokenSymbols[index],
    balance: balancesData ? balancesData[index] : 0n,
  }));

  const filteredTokenData = showOnlyOwned ? combinedTokenData.filter(token => token.balance > 0n) : combinedTokenData;

  return (
    <div className="flex justify-between p-4">
      <BackButton />
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-4 flex justify-end items-center space-x-2">
          <label htmlFor="filterOwned" className="label cursor-pointer">
            <span className="label-text mr-2">Show only tokens with balance</span>
            <input
              type="checkbox"
              id="filterOwned"
              checked={showOnlyOwned}
              onChange={e => setShowOnlyOwned(e.target.checked)}
              className="checkbox checkbox-primary"
            />
          </label>
        </div>
        <table className="table table-zebra border border-gray-200 shadow-lg">
          <thead>
            <tr>
              <th>Token Symbol</th>
              <th>Balance</th>
              <th>Exchange Rate</th>
              <th>Balance in ETH</th>
              <th>Redeem</th>
            </tr>
          </thead>
          <tbody>
            {filteredTokenData.length > 0 ? (
              filteredTokenData.map(token => (
                <TokenRow
                  key={token.tokenAddress}
                  tokenAddress={token.tokenAddress}
                  tokenSymbol={token.tokenSymbol}
                  balance={token.balance}
                  setModalData={data => setTokenData(data)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  {showOnlyOwned ? "No tokens with balance found." : "No tokens available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
    </div>
  );
};

export default ExchangePage;
