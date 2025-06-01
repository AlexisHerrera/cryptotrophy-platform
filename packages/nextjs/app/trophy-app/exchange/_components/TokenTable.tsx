import React, { useMemo, useState } from "react";
import { TokenRow, TokenRowProps } from "./TokenRow";

interface TokenTableProps {
  tokens: TokenRowProps[];
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  const [showOnlyOwned, setShowOnlyOwned] = useState(true);

  const filteredTokens = useMemo(
    () => (showOnlyOwned ? tokens.filter(token => token.balance > 0n) : tokens),
    [showOnlyOwned, tokens],
  );

  return (
    <div>
      <div className="mb-4 flex justify-end items-center space-x-2">
        <label htmlFor="filterOwned" className="label cursor-pointer">
          <span className="label-text mr-2">Show only tokens with balance</span>
          <input
            type="checkbox"
            id="filterOwned"
            checked={showOnlyOwned}
            onChange={e => setShowOnlyOwned(e.target.checked)}
            className="checkbox checkbox-primary"
          />
        </label>
      </div>
      <table className="table table-zebra border border-gray-200 shadow-lg">
        <thead>
          <tr>
            <th>Token Symbol</th>
            <th>Balance</th>
            <th className="hidden md:table-cell">Exchange Rate</th>
            <th className="hidden sm:table-cell">Balance in ETH</th>
            <th>Redeem</th>
          </tr>
        </thead>
        <tbody>
          {filteredTokens.length > 0 ? (
            filteredTokens.map(token => (
              <TokenRow
                key={token.tokenAddress}
                tokenAddress={token.tokenAddress}
                tokenSymbol={token.tokenSymbol}
                balance={token.balance}
                setModalData={token.setModalData}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                {showOnlyOwned ? "No tokens with balance found." : "No tokens available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
