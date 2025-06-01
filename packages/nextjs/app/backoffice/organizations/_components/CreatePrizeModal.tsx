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
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      <div className="rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 font-sans w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">Create a new Prize</h2>

        <label className="block mb-4">
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
            Prize Image
          </span>
          <ExternalResourceInput externalResource={externalResource} setExternalResource={setExternalResource} />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
            Name
          </span>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
            Description
          </span>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </label>

        <div className="flex gap-2 mb-4">
          <label className="flex-1">
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
              Price (tokens)
            </span>
            <input
              type="number"
              min="0"
              step="any"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </label>

          <label className="flex-1">
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-2">
              Stock
            </span>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
              value={stock}
              onChange={e => setStock(e.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold transition hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold transition"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePrizeModal;
