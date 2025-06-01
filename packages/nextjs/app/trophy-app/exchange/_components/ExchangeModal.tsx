import React, { useState } from "react";
import { formatEther, parseEther } from "viem";
import Modal from "~~/components/Modal";
import { IntegerInput, IntegerVariant } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export interface TokenData {
  tokenAddress: string;
  tokenSymbol: string;
  balance: bigint;
  exchangeRate: bigint;
}

interface ExchangeModalProps {
  onClose: () => void;
  tokenData: TokenData;
  onSuccess: () => void;
}

export const ExchangeModal = ({ onClose, tokenData, onSuccess }: ExchangeModalProps) => {
  const { writeContractAsync: orgTokenContract } = useScaffoldWriteContract("OrganizationToken");
  const [tokensToExchange, setTokensToExchange] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    // Validate that a numeric value greater than 0 has been entered
    if (
      !tokensToExchange ||
      isNaN(Number(tokensToExchange)) ||
      Number(tokensToExchange) <= 0 ||
      Number(tokensToExchange) > Number(formatEther(tokenData.balance as bigint))
    ) {
      return;
    }
    try {
      setError(null);
      setIsSubmitting(true);
      const tx = await orgTokenContract({
        functionName: "redeemTokensForEth",
        args: [parseEther(tokensToExchange)],
        contractAddress: tokenData.tokenAddress,
      });
      console.log("Transaction successful:", tx);
      onSuccess();
    } catch (error) {
      console.error("Redeem error:", error);
      // Check if the error message contains specific reversion reasons
      const errorMessage = String(error);
      if (errorMessage.includes("No ETH available for redemption")) {
        setError("No ETH available for redemption at this time.");
      } else if (errorMessage.includes("Insufficient ETH in contract")) {
        setError("The contract doesn't have enough ETH to fulfill this redemption.");
      } else if (errorMessage.includes("Redemption not enabled")) {
        setError("Token redemption is not currently enabled.");
      } else {
        setError("Transaction failed. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tokToETHRatio = 1 / parseFloat(tokenData.exchangeRate.toString());
  const claimEth =
    tokensToExchange && !isNaN(Number(tokensToExchange))
      ? (Number(tokensToExchange) * Number(tokToETHRatio)).toFixed(4)
      : "0";

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center space-y-4 p-6 bg-gray-800 text-white">
        <h2 className="text-2xl font-bold">Redeem {tokenData.tokenSymbol}</h2>
        <p className="text-lg">
          Your balance: {formatEther(tokenData.balance as bigint)} {tokenData.tokenSymbol}
        </p>
        <p className="text-lg">
          Exchange Rate: 1 {tokenData.tokenSymbol} = {tokToETHRatio.toFixed(6)} ETH
        </p>
        <div className="w-full">
          <label className="block text-lg font-medium mb-2">Tokens to Exchange:</label>
          <IntegerInput
            value={tokensToExchange}
            onChange={value => setTokensToExchange(value)}
            placeholder="Enter token amount"
            variant={IntegerVariant.UINT256}
          />
        </div>

        {error && (
          <div className="alert alert-error w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          className="btn btn-primary w-full mt-4"
          onClick={handleRedeem}
          disabled={
            isSubmitting ||
            !tokensToExchange ||
            Number(tokensToExchange) <= 0 ||
            Number(tokensToExchange) > Number(formatEther(tokenData.balance as bigint))
          }
        >
          {isSubmitting ? "Processing..." : `Claim ${claimEth} ETH`}
        </button>
      </div>
    </Modal>
  );
};
