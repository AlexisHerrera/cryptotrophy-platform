import React, { useState } from "react";

interface AdminPanelProps {
  organizationId: bigint;
  addAdmin: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ organizationId, addAdmin }) => {
  const [adminAddress, setAdminAddress] = useState("");

  const handleAddAdmin = async () => {
    try {
      await addAdmin({
        functionName: "addAdmin",
        args: [organizationId, adminAddress],
      });
      alert("Admin added successfully!");
      setAdminAddress("");
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 shadow-lg p-6 font-sans max-w-xl mx-auto mb-8">
      <h2 className="text-2xl font-bold tracking-tight mb-6 text-gray-900 dark:text-gray-100 text-center">
        Admin Panel
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
            Add Admin
          </label>
          <input
            type="text"
            placeholder="Admin Address"
            value={adminAddress}
            onChange={e => setAdminAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            className="w-full mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold transition"
            onClick={handleAddAdmin}
          >
            Add Admin
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;
