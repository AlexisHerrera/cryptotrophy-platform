"use client";

import React from "react";
import CreateOrganizationForm from "~~/app/(cryptotrophy)/create-organization/_components/CreateOrganizationForm";
import { MotionDiv } from "~~/app/motions/use-motion";
import { BackButton } from "~~/components/common/BackButton";

const CreateOrganization = (): React.ReactElement => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between">
        <BackButton />
        <CreateOrganizationForm />
      </div>
    </MotionDiv>
  );
};

export default CreateOrganization;
