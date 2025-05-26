import React from "react";

const FormattedEth = ({ formattedEth }: { formattedEth: string }) => {
  return <p className="mt-2 ml-4 text-sm text-gray-500">{formattedEth} ETH</p>;
};

export default FormattedEth;
