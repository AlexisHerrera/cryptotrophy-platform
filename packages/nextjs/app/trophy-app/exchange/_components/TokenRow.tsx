import React, { useEffect } from "react";
import { TokenData } from "./ExchangeModal";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export interface TokenRowProps {
  tokenAddress: string;
  tokenSymbol: string;
  balance: bigint;
  setModalData: (tokenData: TokenData) => void;
}

export const TokenRow = ({ tokenAddress, tokenSymbol, balance, setModalData }: TokenRowProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo("OrganizationToken");

  // Use type assertion for the hook result
  const readContractResult = useReadContract({
    address: tokenAddress,
    abi: deployedContract?.abi,
    functionName: "getCurrentExchangeRate",
    chainId: targetNetwork.id,
    query: { retry: false },
  });

  // Extract typed values with assertions
  const exchangeRate = readContractResult.data as bigint | undefined;
  const rateFetching = readContractResult.isFetching;
  const rateError = readContractResult.isError;
  const refetchRate = readContractResult.refetch;

  const isLoading = rateFetching;
  const isRedeemable = !isLoading && !rateError && exchangeRate && balance > 0n;

  let balanceInETH = "0";
  if (!isLoading && !rateError && balance !== undefined && exchangeRate) {
    const formattedBalance = parseFloat(formatEther(balance));
    const rate = parseFloat(exchangeRate.toString());
    if (rate > 0) {
      balanceInETH = (formattedBalance / rate).toFixed(4);
    }
  }

  useEffect(() => {
    refetchRate();
  }, [refetchRate]);

  // Determine what to display for exchange rate
  const exchangeRateDisplay = () => {
    if (isLoading) return "Loading...";
    if (rateError) return "Not available";
    if (!exchangeRate) return "Not available";
    return (1 / parseFloat(exchangeRate.toString())).toFixed(6);
  };

  return (
    <tr>
      <td>{tokenSymbol}</td>
      <td>{balance === undefined ? "Loading..." : formatEther(balance)}</td>
      <td className="hidden md:table-cell">{exchangeRateDisplay()}</td>
      <td className="hidden sm:table-cell">{isLoading || rateError ? "N/A" : balanceInETH}</td>
      <td>
        <button
          className="btn btn-primary"
          disabled={!isRedeemable}
          onClick={() => {
            if (!isRedeemable) return;

            console.log("Redeem", {
              tokenAddress,
              tokenSymbol,
              balance: balance,
              exchangeRate: exchangeRate,
            });
            setModalData({
              tokenAddress,
              tokenSymbol,
              balance: balance,
              exchangeRate: exchangeRate as bigint,
            });
          }}
        >
          {rateError ? "Not Available" : "Redeem"}
        </button>
      </td>
    </tr>
  );
};
