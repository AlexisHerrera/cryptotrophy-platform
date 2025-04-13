import React from "react";
import { CreateOrganizationFormProps } from "~~/app/backoffice/create-organization/_components/CreateOrganizationForm";

interface StepCustomerBaseProps {
  formData: {
    organizationName: string;
    admins: string[];
    customerBaseUID: string;
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[]) => void;
}

const StepCustomerBase: React.FC<StepCustomerBaseProps> = ({ formData, handleInputChange }) => {
  return (
    <div>
      {/* Customer base Selection */}
      <div className="mb-4">
        <label htmlFor="customerbase-select" className="block mb-1">
          Select Customer Base
        </label>
        <select
          id="customerbase-select"
          value={formData.customerBaseUID}
          onChange={e => handleInputChange("customerBaseUID", e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Without Customer Base</option>
          <option value="OnChainCustomerBaseV1">On Chain Customer Base</option>
        </select>
      </div>
    </div>
  );
};

export default StepCustomerBase;
