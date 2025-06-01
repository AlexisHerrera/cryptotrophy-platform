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
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 space-y-6 font-sans max-w-xl mx-auto">
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          Organization Name
        </label>
        <FormInput
          label=""
          placeholder="Enter organization name"
          value={formData.organizationName}
          onChange={value => handleInputChange("organizationName", value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          Organization Resource
        </label>
        <ExternalResourceInput
          externalResource={formData.externalResource}
          setExternalResource={handleResourceChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-1">
          Add Admins
        </label>
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
