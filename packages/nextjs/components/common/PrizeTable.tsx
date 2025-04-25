import React from "react";
import { ethers } from "ethers";

export interface Prize {
  id: bigint;
  name: string;
  description: string;
  price: bigint;
  stock: bigint;
}

export interface ClaimAmounts {
  [prizeId: string]: string;
}

interface PrizeTableProps {
  prizes: Prize[];
  claimAmounts: ClaimAmounts;
  onClaimAmountChange: (prizeId: bigint, value: string) => void;
  onClaim: (prizeId: bigint) => void;
  isLoading?: boolean;
}

const PrizeTable: React.FC<PrizeTableProps> = ({
  prizes,
  claimAmounts,
  onClaimAmountChange,
  onClaim,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full border border-gray-300 dark:border-gray-700">
        <thead>
          <tr>
            <th>Prize ID</th>
            <th>Name</th>
            <th>Price (tokens)</th>
            <th>Stock</th>
            <th>Claim</th>
          </tr>
        </thead>
        <tbody>
          {prizes.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4">
                {" "}
                No prizes found.
              </td>
            </tr>
          ) : (
            prizes.map(prize => (
              <tr key={prize.id.toString()} className="hover:bg-base-200">
                {" "}
                <td>{prize.id.toString()}</td>
                <td>{prize.name}</td>
                <td>{ethers.formatUnits(prize.price, 18)}</td>
                <td>{prize.stock.toString()}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="input input-sm input-bordered w-20 hide-number-spinners"
                      value={claimAmounts[prize.id.toString()] || ""}
                      onChange={e => {
                        const requestedAmount = BigInt(e.target.value || "0");
                        if (requestedAmount <= prize.stock) {
                          onClaimAmountChange(prize.id, e.target.value);
                        } else {
                          onClaimAmountChange(prize.id, prize.stock.toString());
                          console.warn("Cannot claim more than available stock.");
                        }
                      }}
                      disabled={prize.stock === 0n}
                    />
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onClaim(prize.id)}
                      disabled={
                        prize.stock === 0n ||
                        !claimAmounts[prize.id.toString()] ||
                        BigInt(claimAmounts[prize.id.toString()] || "0") <= 0n
                      }
                    >
                      Claim
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrizeTable;
