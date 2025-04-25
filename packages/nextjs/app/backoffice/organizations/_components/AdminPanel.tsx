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
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel</h2>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-bold">Add Admin</h3>
          <input
            type="text"
            placeholder="Admin Address"
            value={adminAddress}
            onChange={e => setAdminAddress(e.target.value)}
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary mt-2" onClick={handleAddAdmin}>
            Add Admin
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;
