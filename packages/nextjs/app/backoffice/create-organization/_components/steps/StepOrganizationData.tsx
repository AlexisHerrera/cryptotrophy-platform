import React from "react";
import AddressManager from "~~/app/backoffice/create-organization/_components/AddressManager";
import { CreateOrganizationFormProps } from "~~/app/backoffice/create-organization/_components/CreateOrganizationForm";
import FormInput from "~~/app/backoffice/create-organization/_components/FormInput";
import { ExternalResourceInput } from "~~/components/common/_components/ExternalResourceInput";
import { ExternalResource } from "~~/utils/externalResource";

interface StepOrganizationDataProps {
  formData: {
    organizationName: string;
    externalResource: ExternalResource;
    admins: string[];
  };
  handleInputChange: (field: keyof CreateOrganizationFormProps, value: string | string[] | ExternalResource) => void;
  address: string | undefined;
}

const StepOrganizationData: React.FC<StepOrganizationDataProps> = ({ formData, handleInputChange, address }) => {
  const handleResourceChange = (externalResource: ExternalResource) => {
    handleInputChange("externalResource", externalResource);
  };

  return (
    <div>
      <FormInput
        label="Organization Name"
        placeholder="Enter organization name"
        value={formData.organizationName}
        onChange={value => handleInputChange("organizationName", value)}
      />
      <label className="label text-lg">Organization resource</label>
      <ExternalResourceInput externalResource={formData.externalResource} setExternalResource={handleResourceChange} />
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
