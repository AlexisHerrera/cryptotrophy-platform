import React from "react";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const CopyButton: React.FC<{ address: string; onCopy: () => void }> = ({ address, onCopy }) => {
  return (
    <button
      className="btn btn-sm btn-secondary ml-2 flex items-center gap-1"
      onClick={() => {
        void navigator.clipboard.writeText(address);
        onCopy();
      }}
    >
      <ClipboardDocumentIcon className="w-5 h-5" />
    </button>
  );
};

export default CopyButton;
