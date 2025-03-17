"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TokenRow from "./TokenRow";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import ExchangeModal from "~~/app/exchange/ExchangeModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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
  const router = useRouter();
  const userAddress = address || ethers.ZeroAddress;

  if (orgLoading || !organizationsData) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  const [, , tokenSymbols, tokenAddresses] = organizationsData;

  return (
    <div className="p-4">
      <button className="btn btn-secondary absolute left-3 top-3" onClick={() => router.push("/organizations")}>
        Back
      </button>
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
                setModalData={data => setTokenData(data)}
              />
            ))}
          </tbody>
        </table>
        {tokenData !== null && <ExchangeModal tokenData={tokenData} onClose={() => setTokenData(null)} />}
      </div>
    </div>
  );
};

export default ExchangePage;
