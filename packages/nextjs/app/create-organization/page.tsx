import React from "react";
import CreateOrganizationForm from "~~/app/create-organization/_components/CreateOrganizationForm";
import { MotionDiv } from "~~/app/motions/use-motion";

const CreateOrganization = (): React.ReactElement => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto p-4 max-w-3xl">
        <CreateOrganizationForm />
      </div>
    </MotionDiv>
  );
};

export default CreateOrganization;
