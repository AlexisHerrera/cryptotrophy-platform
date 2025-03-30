import React from "react";
import { CreateOrganizationFormProps } from "~~/app/(cryptotrophy)/create-organization/_components/CreateOrganizationForm";
import FormInput from "~~/app/(cryptotrophy)/create-organization/_components/FormInput";
import { IntegerInput, IntegerVariant } from "~~/components/scaffold-eth";

interface StepEthereumBackingProps {
  formData: {
    tokenSymbol: string;
    initialMint: string;
    ethBacking: string;
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[]) => void;
}

const StepEthereumBacking: React.FC<StepEthereumBackingProps> = ({ formData, handleInputChange }) => {
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
      </div>
    </div>
  );
};

export default StepEthereumBacking;
