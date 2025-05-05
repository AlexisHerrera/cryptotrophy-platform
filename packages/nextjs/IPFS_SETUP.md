# IPFS Integration Setup

This application uses [Filebase](https://filebase.com/) for storing prize images on IPFS. Follow these steps to set up your environment:

## Setting up your Filebase Credentials

1. Create an account on [Filebase](https://filebase.com/) if you don't already have one
2. Generate your Access Key and Secret Key from your Filebase dashboard
3. Create an IPFS bucket in your Filebase account to store the files
4. Create a `.env` file in the `packages/nextjs` directory with the following content:

```
FILEBASE_ACCESS_KEY=your_filebase_access_key
FILEBASE_SECRET_KEY=your_filebase_secret_key
FILEBASE_BUCKET=your_filebase_bucket_name
```

Replace the values with your actual Filebase credentials and bucket name.

## How It Works

1. When creating a new prize, you can upload an image
2. The image is sent to a secure server-side API route
3. The API route uploads the file to IPFS using Filebase's S3-compatible API
4. The IPFS Content Identifier (CID) is returned and stored in the smart contract
5. When displaying prizes, the images are retrieved from IPFS using the CID

## Security

This implementation keeps your Filebase credentials secure on the server and never exposes them to the client. All uploads are handled through a secure API route.

## Troubleshooting

- If images fail to upload, check that your Filebase credentials are correct
- Ensure your Filebase bucket exists and is set to use the IPFS network
- Check server logs and browser console for any error messages related to the upload process 