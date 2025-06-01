import React from "react";
import { useAccount } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ExternalResource, getDescription } from "~~/utils/externalResource";

interface StepReviewDataProps {
  formData: {
    organizationName: string;
    admins: string[];
    tokenSymbol: string;
    initialMint: string;
    ethBacking: string;
    externalResource: ExternalResource;
  };
}

export const formatEthBacking = (value: string): string => {
  const ethValue = parseFloat((parseInt(value || "0", 10) / 1e18).toFixed(6)); // Convertir wei a ETH
  return ethValue >= 0.001 ? `${ethValue} ETH` : `${value} wei`;
};

const StepReviewData: React.FC<StepReviewDataProps> = ({ formData }) => {
  const { address } = useAccount();
  return (
    <div className="space-y-8 font-sans max-w-xl mx-auto">
      <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 space-y-5">
        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            Organization Name
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formData.organizationName}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            Organization Resource
          </div>
          <div className="text-base text-gray-800 dark:text-gray-200">{getDescription(formData.externalResource)}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            Admins
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {address && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 shadow-sm">
                <BlockieAvatar address={address} size={28} />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                  {`${address.slice(0, 6)}...${address.slice(-4)} `}
                  <span className="text-xs font-normal text-gray-400">(You)</span>
                </span>
              </div>
            )}
            {formData.admins.map((admin, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm"
              >
                <BlockieAvatar address={admin} size={28} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {`${admin.slice(0, 6)}...${admin.slice(-4)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            Token Symbol
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{formData.tokenSymbol}</div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            Initial Mint
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">
            {formData.initialMint} <span className="font-semibold">{formData.tokenSymbol}</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1 tracking-wider">
            ETH Backing
          </div>
          <div className="text-base text-gray-900 dark:text-gray-100">{formatEthBacking(formData.ethBacking)}</div>
        </div>
      </div>
    </div>
  );
};

export default StepReviewData;
