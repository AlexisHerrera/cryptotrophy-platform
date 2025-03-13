import React from "react";

interface ModalLeaveJoinProps {
  title: string;
  message: string;
  isOpen: boolean;
  isLoading: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const ModalLeaveJoin: React.FC<ModalLeaveJoinProps> = ({ title, message, isOpen, isLoading, onAccept, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-base-100 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">{title}</h2>
        <p className="text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button
            className={`btn btn-primary ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLeaveJoin;
