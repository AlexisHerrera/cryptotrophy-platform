import React from "react";
import { CreateOrganizationFormProps } from "~~/app/backoffice/create-organization/_components/CreateOrganizationForm";
import FormInput from "~~/app/backoffice/create-organization/_components/FormInput";
import FormattedEth from "~~/components/common/FormattedEth";
import { IntegerInput, IntegerVariant } from "~~/components/scaffold-eth";
import { ExternalResource } from "~~/utils/externalResource";
import formatToEth from "~~/utils/scaffold-eth/formatToEth";

interface StepEthereumBackingProps {
  formData: {
    tokenSymbol: string;
    initialMint: string;
    ethBacking: string;
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[] | ExternalResource) => void;
}

const StepEthereumBacking: React.FC<StepEthereumBackingProps> = ({ formData, handleInputChange }) => {
  const formattedEth = formatToEth(formData.ethBacking);

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 space-y-6 font-sans max-w-xl mx-auto">
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          Token Symbol
        </label>
        <FormInput
          label=""
          placeholder="Enter token symbol"
          value={formData.tokenSymbol}
          onChange={value => handleInputChange("tokenSymbol", value.toUpperCase())}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          Initial Mint
        </label>
        <FormInput
          label=""
          type="number"
          placeholder="Enter initial mint"
          value={formData.initialMint}
          onChange={value => handleInputChange("initialMint", value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          ETH Backing (wei)
        </label>
        <IntegerInput
          value={formData.ethBacking}
          onChange={value => handleInputChange("ethBacking", value)}
          placeholder="Enter ETH backing amount"
          variant={IntegerVariant.UINT256}
        />
        <FormattedEth formattedEth={formattedEth} />
      </div>
    </div>
  );
};

export default StepEthereumBacking;
