import React, { useState } from "react";
import { formatEther, parseEther } from "viem";
import { TokenData } from "~~/app/trophy-app/exchange/page";
import Modal from "~~/components/Modal";
import { IntegerInput, IntegerVariant } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ExchangeModalProps {
  onClose: () => void;
  tokenData: TokenData;
}

const ExchangeModal = ({ onClose, tokenData }: ExchangeModalProps) => {
  const { writeContractAsync: orgTokenContract } = useScaffoldWriteContract("OrganizationToken");
  const [tokensToExchange, setTokensToExchange] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRedeem = async () => {
    // Validar que se haya ingresado un valor numérico mayor que 0
    if (
      !tokensToExchange ||
      isNaN(Number(tokensToExchange)) ||
      Number(tokensToExchange) <= 0 ||
      Number(tokensToExchange) > Number(formatEther(tokenData.balance as bigint))
    ) {
      return;
    }
    try {
      setIsSubmitting(true);
      const tx = await orgTokenContract({
        functionName: "redeemTokensForEth",
        args: [parseEther(tokensToExchange)],
        contractAddress: tokenData.tokenAddress,
      });
      console.log("Transaction successful:", tx);
      onClose();
    } catch (error) {
      console.error("Redeem error:", error);
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
      <div className="flex flex-col items-center space-y-4 p-4">
        <h2 className="text-2xl font-bold">Redeem {tokenData.tokenSymbol}</h2>
        <p className="text-gray-500 text-lg">
          Your balance: {formatEther(tokenData.balance as bigint)} {tokenData.tokenSymbol}
        </p>
        <p className="text-gray-500 text-lg">
          Exchange Rate: 1 {tokenData.tokenSymbol} = {tokToETHRatio} ETH
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

export default ExchangeModal;
