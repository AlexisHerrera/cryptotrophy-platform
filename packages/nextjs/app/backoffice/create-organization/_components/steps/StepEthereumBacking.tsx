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
    <div>
      <FormInput
        label="Token Symbol"
        placeholder="Enter token symbol"
        value={formData.tokenSymbol}
        onChange={value => handleInputChange("tokenSymbol", value.toUpperCase())}
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
        <FormattedEth formattedEth={formattedEth} />
      </div>
    </div>
  );
};

export default StepEthereumBacking;
