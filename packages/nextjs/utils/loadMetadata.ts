import { getIPFSUrl } from "~~/utils/ipfs";

const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];

const isImagePath = (url: string): boolean => {
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * General-purpose metadata loader.
 *
 * @param baseURI - The URI to an image, metadata.json, or folder containing it.
 * @param options - Optional config
 * @returns Parsed metadata object, or a default object if it's just an image path.
 */
export async function loadMetadata<T extends Record<string, any>>(
  baseURI: string,
  options?: {
    defaultField?: keyof T;
    allowImageOnly?: boolean;
  },
): Promise<T> {
  if (!baseURI) return {} as T;
  console.log("loadMetadata baseURI", baseURI);

  const resolvedUrl = getIPFSUrl(baseURI);

  // Case 1: It's a direct image path
  if (isImagePath(resolvedUrl) && options?.allowImageOnly && options.defaultField) {
    return { [options.defaultField]: resolvedUrl } as T;
  }

  // Case 2: It's a direct link to metadata.json
  if (resolvedUrl.toLowerCase().endsWith(".json")) {
    try {
      const res = await fetch(resolvedUrl);
      return await res.json();
    } catch (error) {
      console.error("Error fetching JSON metadata from full path:", error);
      return {} as T;
    }
  }

  try {
    // Do a HEAD request to inspect content type
    const headRes = await fetch(resolvedUrl, { method: "HEAD" });

    const contentType = headRes.headers.get("content-type") || "";
    console.log("contentType", contentType);

    // Check if it's an image
    if (contentType.startsWith("image/") && options?.allowImageOnly && options.defaultField) {
      return { [options.defaultField]: resolvedUrl } as T;
    }

    // Check if it's JSON
    if (contentType.includes("application/json")) {
      const res = await fetch(resolvedUrl);
      return await res.json();
    }

    // Fallback to trying `metadata.json` inside directory
    const metadataUrl = resolvedUrl.endsWith("/") ? `${resolvedUrl}metadata.json` : `${resolvedUrl}/metadata.json`;
    const res = await fetch(metadataUrl);
    return await res.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {} as T;
  }
}
