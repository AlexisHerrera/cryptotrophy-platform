import React, { useEffect } from "react";
import { ethers } from "ethers";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

// Ajusta la ruta según corresponda

interface TokenRowProps {
  tokenAddress: string;
  tokenSymbol: string;
  userAddress: string;
}

const TokenRow = ({ tokenAddress, tokenSymbol, userAddress }: TokenRowProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContract } = useDeployedContractInfo("OrganizationToken");
  // Lee el balance del usuario en el contrato token
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

  // Lee el exchange rate actual
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

  // Calcula el balance en ETH: se asume que exchangeRate es tokens por ETH.
  let balanceInETH = "0";
  if (!isLoading && balance && exchangeRate) {
    const formattedBalance = parseFloat(formatEther(balance as bigint));
    const rate = parseFloat(exchangeRate.toString());
    if (rate > 0) {
      balanceInETH = (formattedBalance / rate).toFixed(4);
    }
  }

  // Refresca los valores cada vez que se renderiza el componente
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
        {/* Botón Redeem: por ahora no realiza ninguna acción */}
        <button className="btn btn-primary">Redeem</button>
      </td>
    </tr>
  );
};

export default TokenRow;
