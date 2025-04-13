import React, { useState } from "react";

interface ManageCustomersModalProps {
  organizationId: bigint;
  addCustomer: any;
}

const ManageCustomersModal: React.FC<ManageCustomersModalProps> = ({ organizationId, addCustomer }) => {
  const [customerAddress, setCustomerAddress] = useState("");

  const handleAddCustomer = async () => {
    try {
      await addCustomer({
        functionName: "addCustomer",
        args: [organizationId, customerAddress],
      });
      alert("Customer added successfully!");
      setCustomerAddress("");
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Admin Modal</h2>
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-bold">Add Customer</h3>
          <input
            type="text"
            placeholder="Customer Address"
            value={customerAddress}
            onChange={e => setCustomerAddress(e.target.value)}
            className="input input-bordered w-full"
          />
          <button className="btn btn-primary mt-2" onClick={handleAddCustomer}>
            Add Customer
          </button>
        </div>
      </div>
    </div>
  );
};
export default ManageCustomersModal;
