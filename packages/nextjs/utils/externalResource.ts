import { uploadToIPFS } from "~~/utils/ipfs";

/**
 * External resource that can be referenced from a contract as a baseURI.
 */
export type ExternalResource =
  | { type: "none" }
  | { type: "url"; value: string }
  | { type: "file"; value: File }
  | { type: "image"; value: File };

export function createNoneResource(): ExternalResource {
  return { type: "none" };
}

export function createUrlResource(url: string): ExternalResource {
  return { type: "url", value: url };
}

export function createFileResource(file: File): ExternalResource {
  return { type: "file", value: file };
}

export function createImageResource(file: File): ExternalResource {
  return { type: "image", value: file };
}

/**
 * Receives an ExternalResource and returns the URI that should be written to the contract.
 * In case it receives an file, it uploads the file to IPFS and returns the ipfs://<CID>.
 * @param externalResource The IPFS File content, URL or empty
 * @returns The URI that should be written to the contract.
 */
export async function generateContractBaseUri(resource: ExternalResource): Promise<string> {
  switch (resource.type) {
    case "none":
      return "";

    case "url":
      return resource.value;

    case "file":
      const cid = await uploadToIPFS(resource.value);
      console.log("File uploaded successfully, cid:", cid);
      return "ipfs://" + cid;

    default:
      throw new Error("Unhandled resource type");
  }
}

export function getDescription(resource: ExternalResource): string {
  if (resource.type === "url") {
    return resource.value;
  } else if (resource.type === "image") {
    return "Image. It will be stored in IPFS.";
  } else {
    return "";
  }
}
