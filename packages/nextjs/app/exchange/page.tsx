"use client";

import React from "react";
import TokenRow from "./TokenRow";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const ExchangePage = () => {
  const { address } = useAccount();
  const { data: organizationsData, isLoading: orgLoading } = useScaffoldReadContract({
    contractName: "OrganizationManager",
    functionName: "listOrganizationsWithDetails",
  });

  const userAddress = address || ethers.ZeroAddress;

  if (orgLoading || !organizationsData) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  const [, , tokenSymbols, tokenAddresses] = organizationsData;

  return (
    <div className="p-4">
      <div className="container mx-auto p-4 max-w-4xl">
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
            {tokenAddresses.map((tokenAddress, index) => (
              <TokenRow
                key={tokenAddress}
                tokenAddress={tokenAddress}
                tokenSymbol={tokenSymbols[index]}
                userAddress={userAddress}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangePage;
