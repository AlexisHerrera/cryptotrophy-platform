import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";

// Configure Filebase credentials (server-side only)
const FILEBASE_ACCESS_KEY = process.env.FILEBASE_ACCESS_KEY || "";
const FILEBASE_SECRET_KEY = process.env.FILEBASE_SECRET_KEY || "";
const FILEBASE_BUCKET = process.env.FILEBASE_BUCKET || "";

// Initialize S3 client with Filebase endpoint
const s3 = new AWS.S3({
  accessKeyId: FILEBASE_ACCESS_KEY,
  secretAccessKey: FILEBASE_SECRET_KEY,
  endpoint: "https://s3.filebase.com",
  region: "us-east-1", // Required but not used
  s3ForcePathStyle: true, // Required for S3-compatible storage
});

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Convert File to Buffer for AWS SDK
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a unique object key (filename)
    const objectKey = `${Date.now()}-${file.name}`;

    // Upload to Filebase bucket
    const params = {
      Bucket: FILEBASE_BUCKET,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type,
    };

    // Use putObject instead of upload to access the headers
    const putObjectPromise = new Promise<string>((resolve, reject) => {
      const request = s3.putObject(params);
      request.on("httpHeaders", (statusCode, headers) => {
        if (statusCode === 200) {
          // Extract the CID from the response headers
          const cid = headers["x-amz-meta-cid"];
          resolve(cid);
        }
      });
      request.on("error", err => {
        reject(err);
      });
      request.send();
    });

    const cid = await putObjectPromise;
    console.log("File uploaded successfully to IPFS with CID:", cid);

    // Return the CID directly
    return NextResponse.json({ success: true, cid, location: `https://ipfs.filebase.io/ipfs/${cid}` });
  } catch (error) {
    console.error("Error uploading to IPFS via Filebase:", error);
    return NextResponse.json({ error: "Failed to upload image to IPFS" }, { status: 500 });
  }
}
