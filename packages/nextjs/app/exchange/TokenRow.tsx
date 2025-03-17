import React, { useEffect } from "react";
import { ethers } from "ethers";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { TokenData } from "~~/app/exchange/page";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface TokenRowProps {
  tokenAddress: string;
  tokenSymbol: string;
  userAddress: string;
  setModalData: (tokenData: TokenData) => void;
}

const TokenRow = ({ tokenAddress, tokenSymbol, userAddress, setModalData }: TokenRowProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo("OrganizationToken");
  const {
    data: balance,
    isFetching: balanceFetching,
    refetch: refetchBalance,
  } = useReadContract({
    address: tokenAddress,
    abi: deployedContract?.abi,
    functionName: "balanceOf",
    args: [userAddress || ethers.ZeroAddress],
    chainId: targetNetwork.id,
    query: { retry: false },
  });

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

  const isLoading = balanceFetching || rateFetching;

  let balanceInETH = "0";
  if (!isLoading && balance && exchangeRate) {
    const formattedBalance = parseFloat(formatEther(balance as bigint));
    const rate = parseFloat(exchangeRate.toString());
    if (rate > 0) {
      balanceInETH = (formattedBalance / rate).toFixed(4);
    }
  }

  useEffect(() => {
    refetchBalance();
    refetchRate();
  }, [refetchBalance, refetchRate]);

  return (
    <tr>
      <td>{tokenSymbol}</td>
      <td>{isLoading || balance === undefined ? "Loading..." : formatEther(balance as bigint)}</td>
      <td>{isLoading || !exchangeRate ? "Loading..." : exchangeRate.toString()}</td>
      <td>{isLoading ? "Loading..." : balanceInETH}</td>
      <td>
        <button
          className="btn btn-primary"
          onClick={() =>
            setModalData({
              tokenAddress,
              tokenSymbol,
              balance: balance as bigint,
              exchangeRate: exchangeRate as bigint,
            })
          }
        >
          Redeem
        </button>
      </td>
    </tr>
  );
};

export default TokenRow;
