import React from "react";
import AddressManager from "~~/app/backoffice/create-organization/_components/AddressManager";
import { CreateOrganizationFormProps } from "~~/app/backoffice/create-organization/_components/CreateOrganizationForm";
import FormInput from "~~/app/backoffice/create-organization/_components/FormInput";

interface StepOrganizationDataProps {
  formData: {
    organizationName: string;
    baseURI: string;
    admins: string[];
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[]) => void;
  address: string | undefined;
}

const StepOrganizationData: React.FC<StepOrganizationDataProps> = ({ formData, handleInputChange, address }) => {
  return (
    <div>
      <FormInput
        label="Organization Name"
        placeholder="Enter organization name"
        value={formData.organizationName}
        onChange={value => handleInputChange("organizationName", value)}
      />
      <FormInput
        label="Organization Repository"
        placeholder="Enter organization repository path"
        value={formData.baseURI}
        onChange={value => handleInputChange("baseURI", value)}
      />
      <div className="form-control">
        <label className="label text-lg">Add Admins</label>
        <AddressManager
          addresses={formData.admins}
          setAddresses={admins => handleInputChange("admins", admins)}
          defaultAddress={address}
        />
      </div>
    </div>
  );
};

export default StepOrganizationData;
