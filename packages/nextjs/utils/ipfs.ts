// Client-side IPFS utility functions

/**
 * Uploads a file to IPFS via Filebase (securely through our API)
 * @param file The file to upload
 * @returns The IPFS CID (Content Identifier) for the uploaded file
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Create a FormData object for the file
    const formData = new FormData();
    formData.append("file", file);

    // Send the file to our secure API endpoint
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data = await response.json();
    return data.cid; // Should return the CID from the response
  } catch (error) {
    console.error("Error uploading to IPFS via Filebase:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

/**
 * Generates an IPFS gateway URL for accessing content with the given CID
 * @param baseURI The IPFS Content Identifier or URL
 * @returns A URL that can be used to access the content
 */
export function getIPFSUrl(baseURI: string): string {
  if (baseURI.startsWith("ipfs://")) {
    return baseURI.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return baseURI;
}
