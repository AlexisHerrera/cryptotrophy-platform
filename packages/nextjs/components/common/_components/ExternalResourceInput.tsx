import React, { useState } from "react";
import Image from "next/image";
import {
  ExternalResource,
  createImageResource,
  createNoneResource,
  createUrlResource,
} from "~~/utils/externalResource";

type Mode = "upload" | "url";

export const ExternalResourceInput = ({
  externalResource,
  setExternalResource,
}: {
  externalResource: ExternalResource;
  setExternalResource: (val: ExternalResource) => void;
}) => {
  const [mode, setMode] = useState<Mode>("upload");
  const [resourceUrlInput, setUrlInput] = useState<string>(
    externalResource.type === "url" ? externalResource.value : "",
  );
  const [imagePreview, setImagePreview] = useState<string>("");
  const [resourceImageInput, setResourceImageInput] = useState<File | null>(
    externalResource.type === "image" ? externalResource.value : null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      setExternalResource(createImageResource(selectedImage));
      setResourceImageInput(selectedImage);

      // Create a preview URL
      const previewUrl = URL.createObjectURL(selectedImage);
      setImagePreview(previewUrl);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExternalResource(createUrlResource(e.target.value));
    setUrlInput(e.target.value);
  };

  return (
    <div className="mt-4 w-full">
      {/* Toggle buttons */}
      <div className="flex justify-center mb-2 space-x-2">
        <button
          className={`px-4 py-1 rounded ${
            mode === "upload"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
          onClick={() => {
            setMode("upload");
            if (resourceImageInput) {
              setExternalResource(createImageResource(resourceImageInput));
            } else {
              setExternalResource(createNoneResource());
            }
          }}
        >
          Upload
        </button>
        <button
          className={`px-4 py-1 rounded ${
            mode === "url" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
          }`}
          onClick={() => {
            setMode("url");
            setExternalResource(createUrlResource(resourceUrlInput)); // Clear upload state
          }}
        >
          Use URL
        </button>
      </div>

      {/* Preview */}
      <div className="mt-2 flex items-center justify-center w-full">
        {mode === "upload" ? (
          imagePreview ? (
            <div className="relative w-full h-48 rounded-md overflow-hidden">
              <Image src={imagePreview} alt="Prize preview" fill className="object-cover" />
              <button
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                onClick={() => {
                  setExternalResource(createNoneResource());
                  setResourceImageInput(null);
                  setImagePreview("");
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
                  fill="none"
                  viewBox="0 0 20 16"
                  xmlns="http://www.w3.org/2000/svg"
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
          )
        ) : (
          <div className="w-full flex flex-col gap-2">
            <input
              type="text"
              value={resourceUrlInput}
              onChange={e => handleImageUrlChange(e)}
              placeholder="Paste resource URL (e.g. https://... or ipfs://...)"
              className="px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
