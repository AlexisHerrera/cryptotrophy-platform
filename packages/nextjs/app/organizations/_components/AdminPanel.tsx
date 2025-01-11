import React, { useState } from "react";

interface AdminPanelProps {
  organizationId: bigint;
  addAdmin: any;
  addUser: any;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ organizationId, addAdmin, addUser }) => {
  const [adminAddress, setAdminAddress] = useState("");
  const [userAddress, setUserAddress] = useState("");

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

  const handleAddUser = async () => {
    try {
      await addUser({
        functionName: "addUser",
        args: [organizationId, userAddress],
      });
      alert("User added successfully!");
      setUserAddress("");
    } catch (error) {
      console.error("Error adding user:", error);
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
        <div>
          <h3 className="font-bold">Add User</h3>
          <input
            type="text"
            placeholder="User Address"
            value={userAddress}
            onChange={e => setUserAddress(e.target.value)}
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary mt-2" onClick={handleAddUser}>
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};
export default AdminPanel;
