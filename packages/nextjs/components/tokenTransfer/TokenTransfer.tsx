import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { DECIMALS_TOKEN } from "~~/settings";

interface TokenTransferProps {
  tokenAddress: string;
  spenderAddress: string;
}

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
];

export const TokenTransfer: React.FC<TokenTransferProps> = ({ tokenAddress, spenderAddress }) => {
  const { address: userAddress } = useAccount();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [balance, setBalance] = useState<bigint>(0n);

  useEffect(() => {
    if (!userAddress || !tokenAddress || tokenAddress === ethers.ZeroAddress) return;

    const fetchData = async () => {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

        const rawAllowance = await tokenContract.allowance(userAddress, spenderAddress);
        setAllowance(rawAllowance);

        const rawBalance = await tokenContract.balanceOf(userAddress);
        setBalance(rawBalance);
      } catch (error) {
        console.error("Error reading data:", error);
      }
    };

    void fetchData();
  }, [userAddress, tokenAddress, spenderAddress]);

  const handleApprove = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

      const amountToApprove = ethers.parseUnits("100", DECIMALS_TOKEN);

      const tx = await tokenContract.approve(spenderAddress, amountToApprove);
      await tx.wait();

      // Refrescar allowance
      const newAllowance = await tokenContract.allowance(userAddress, spenderAddress);
      setAllowance(newAllowance);

      console.log("Approved:", newAllowance.toString(), "wei");
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  return (
    <div>
      <p>Token: {tokenAddress}</p>
      <p>Your Balance: {ethers.formatUnits(balance, 18)} tokens</p>
      <p>
        Your Allowance to {spenderAddress}: {ethers.formatUnits(allowance, 18)}
      </p>
      <button onClick={handleApprove}>Approve 100</button>
    </div>
  );
};

export default TokenTransfer;
