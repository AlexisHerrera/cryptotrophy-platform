import React from "react";
import { CreateOrganizationFormProps } from "~~/app/(cryptotrophy)/create-organization/_components/CreateOrganizationForm";
import FormInput from "~~/app/(cryptotrophy)/create-organization/_components/FormInput";
import { IntegerInput, IntegerVariant } from "~~/components/scaffold-eth";
import { DECIMALS_TOKEN } from "~~/settings";

interface StepEthereumBackingProps {
  formData: {
    tokenSymbol: string;
    initialMint: string;
    ethBacking: string;
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[]) => void;
}

const StepEthereumBacking: React.FC<StepEthereumBackingProps> = ({ formData, handleInputChange }) => {
  const getEthAmount = (wei: string): number => {
    const weiValue = Number(wei);
    if (isNaN(weiValue)) return 0;
    return weiValue / Math.pow(10, DECIMALS_TOKEN);
  };
  const ethAmount = getEthAmount(formData.ethBacking);
  const formattedEth = ethAmount > 0 && ethAmount < 0.0001 ? ethAmount.toExponential() : ethAmount.toFixed(4);

  return (
    <div>
      <FormInput
        label="Token Symbol"
        placeholder="Enter token symbol"
        value={formData.tokenSymbol}
        onChange={value => handleInputChange("tokenSymbol", value)}
      />
      <FormInput
        label="Initial Mint"
        type="number"
        placeholder="Enter initial mint"
        value={formData.initialMint}
        onChange={value => handleInputChange("initialMint", value)}
      />
      <div className="form-control">
        <label className="label text-lg">ETH Backing (wei)</label>
        <IntegerInput
          value={formData.ethBacking}
          onChange={value => handleInputChange("ethBacking", value)}
          placeholder="Enter ETH backing amount"
          variant={IntegerVariant.UINT256}
        />
        <p className="mt-2 ml-4 text-sm text-gray-500">{formattedEth} ETH</p>
      </div>
    </div>
  );
};

export default StepEthereumBacking;
