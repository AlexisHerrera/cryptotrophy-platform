"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { ExternalResourceInput } from "~~/components/common/_components/ExternalResourceInput";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ExternalResource, createNoneResource, generateContractBaseUri } from "~~/utils/externalResource";
import { notification } from "~~/utils/scaffold-eth";

interface CreatePrizeModalProps {
  orgId: string; // ID de la organización, como string
  isOpen: boolean; // Si el modal se muestra o no
  onClose: () => void; // Función para cerrar el modal
}

const CreatePrizeModal: React.FC<CreatePrizeModalProps> = ({ orgId, isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [externalResource, setExternalResource] = useState<ExternalResource>(createNoneResource());

  // Hook para escribir al contrato "Prizes" -> "createPrize"
  const { writeContractAsync: createPrize } = useScaffoldWriteContract("Prizes");

  if (!isOpen) {
    return null; // No renderiza nada si no está abierto
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const baseURI = await generateContractBaseUri(externalResource);
      if (baseURI === "") {
        notification.error("Please select an image or url for the prize");
        setIsLoading(false);
        return;
      }

      // Convertir price y stock a BigInt
      const priceBN = ethers.parseUnits(price || "0", 18);
      const stockBN = BigInt(stock || "0");

      notification.info("Creating prize on blockchain...");

      console.log("Using URL: ", baseURI);
      await createPrize({
        functionName: "createPrize",
        args: [BigInt(orgId), name, description, priceBN, stockBN, baseURI],
      });

      notification.success("Prize created successfully!");
      // Limpia campos y cierra
      setName("");
      setDescription("");
      setPrice("0");
      setStock("0");
      setExternalResource(createNoneResource());

      onClose();
    } catch (error) {
      console.error("Error creating prize:", error);
      notification.error("Failed to create prize");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create a new Prize</h2>

        <label className="block mb-4">
          <span className="text-sm">Prize Image</span>
          <ExternalResourceInput externalResource={externalResource} setExternalResource={setExternalResource} />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Name</span>
          <input
            type="text"
            className="input input-bordered w-full"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          <span className="text-sm">Description</span>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>

        <div className="flex gap-2">
          <label className="flex-1">
            <span className="text-sm">Price (tokens)</span>
            <input
              type="number"
              min="0"
              step="any"
              className="input input-bordered w-full"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </label>

          <label className="flex-1">
            <span className="text-sm">Stock</span>
            <input
              type="number"
              min="0"
              className="input input-bordered w-full"
              value={stock}
              onChange={e => setStock(e.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end mt-4">
          <button className="btn btn-secondary mr-2" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrizeModal;
