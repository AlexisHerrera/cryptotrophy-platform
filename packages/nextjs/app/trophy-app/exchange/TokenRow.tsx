import React, { useEffect } from "react";
import { ethers } from "ethers";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { TokenData } from "~~/app/trophy-app/exchange/page";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface TokenRowProps {
  tokenAddress: string;
  tokenSymbol: string;
  userAddress: string;
  balance: bigint;
  setModalData: (tokenData: TokenData) => void;
}

const TokenRow = ({ tokenAddress, tokenSymbol, userAddress, balance, setModalData }: TokenRowProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo("OrganizationToken");

  const {
    data: exchangeRate,
    isFetching: rateFetching,
    refetch: refetchRate,
  } = useReadContract({
    address: tokenAddress,
    abi: deployedContract?.abi,
    functionName: "getCurrentExchangeRate",
    chainId: targetNetwork.id,
    query: { retry: false },
  });

  const isLoading = rateFetching;

  let balanceInETH = "0";
  if (!isLoading && balance !== undefined && exchangeRate) {
    const formattedBalance = parseFloat(formatEther(balance));
    const rate = parseFloat(exchangeRate.toString());
    if (rate > 0) {
      balanceInETH = (formattedBalance / rate).toFixed(4);
    }
  }

  useEffect(() => {
    refetchRate();
  }, [refetchRate]);

  return (
    <tr>
      <td>{tokenSymbol}</td>
      <td>{balance === undefined ? "Loading..." : formatEther(balance)}</td>
      <td>{isLoading || !exchangeRate ? "Loading..." : (1 / parseFloat(exchangeRate.toString())).toFixed(6)}</td>
      <td>{isLoading ? "Loading..." : balanceInETH}</td>
      <td>
        <button
          className="btn btn-primary"
          disabled={balance === 0n}
          onClick={() => {
            console.log("Redeem", {
              tokenAddress,
              tokenSymbol,
              balance: balance,
              exchangeRate: exchangeRate as bigint,
            });
            setModalData({
              tokenAddress,
              tokenSymbol,
              balance: balance,
              exchangeRate: exchangeRate as bigint,
            });
          }}
        >
          Redeem
        </button>
      </td>
    </tr>
  );
};

export default TokenRow;
