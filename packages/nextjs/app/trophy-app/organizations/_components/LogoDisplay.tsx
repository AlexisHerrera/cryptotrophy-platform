import React, { useState } from "react";

export const LogoDisplay: React.FC<{
  logoUrl?: string;
  organizationName: string;
}> = ({ logoUrl, organizationName }) => {
  const [hasError, setHasError] = useState(false);
  const showImage = logoUrl && !hasError;

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-md h-auto shadow-lg rounded-md overflow-hidden mb-4 flex items-center justify-center">
        {showImage ? (
          <div className="w-full aspect-[4/3] relative">
            <img
              src={logoUrl}
              alt={organizationName}
              className="absolute inset-0 w-full h-full object-cover rounded-md"
              onError={() => setHasError(true)}
              draggable={false}
            />
          </div>
        ) : (
          <div className="hidden md:flex w-full aspect-[4/3] bg-gray-200 dark:bg-gray-700 items-center justify-center text-gray-500 dark:text-gray-400">
            No logo available
          </div>
        )}
      </div>
    </div>
  );
};
