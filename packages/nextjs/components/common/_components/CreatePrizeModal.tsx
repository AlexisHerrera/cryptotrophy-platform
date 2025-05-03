"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { uploadToIPFS } from "~~/utils/ipfs";
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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Hook para escribir al contrato "Prizes" -> "createPrize"
  const { writeContractAsync: createPrize } = useScaffoldWriteContract("Prizes");

  if (!isOpen) {
    return null; // No renderiza nada si no está abierto
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!image) {
        notification.error("Please select an image for the prize");
        setIsLoading(false);
        return;
      }

      // Upload image to IPFS
      notification.info("Uploading image to IPFS...");
      let imageCID = "";

      try {
        imageCID = await uploadToIPFS(image);
        console.log("Image uploaded successfully, cid:", imageCID);
      } catch (error) {
        console.error("Error uploading image:", error);
        notification.error("Failed to upload image. Using empty image URL.");
      }

      // Convertir price y stock a BigInt
      const priceBN = ethers.parseUnits(price || "0", 18);
      const stockBN = BigInt(stock || "0");

      notification.info("Creating prize on blockchain...");

      await createPrize({
        functionName: "createPrize",
        args: [BigInt(orgId), name, description, priceBN, stockBN, imageCID],
      });

      notification.success("Prize created successfully!");
      // Limpia campos y cierra
      setName("");
      setDescription("");
      setPrice("0");
      setStock("0");
      setImage(null);
      setImagePreview(null);

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
          <div className="mt-1 flex items-center justify-center w-full">
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={imagePreview} alt="Prize preview" fill className="object-cover" />
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Click to upload image</p>
                </div>
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            )}
          </div>
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
