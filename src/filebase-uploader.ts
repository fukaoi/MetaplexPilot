import { create } from "kubo-rpc-client";
import { 
  UmiPlugin,
  createGenericFile,
  Umi,
} from "@metaplex-foundation/umi";
import { Buffer } from "buffer";
import dotenv from "dotenv";

dotenv.config();

export type FilebaseUploaderOptions = {
  url?: string;
  token?: string;
  gateway?: string;
};

export const filebaseUploader = (
  options: FilebaseUploaderOptions = {}
): UmiPlugin => ({
  install(umi: Umi) {
    const filebaseClient = createFilebaseClient(options);
    const uploader = createFilebaseUploader(filebaseClient, options);
    umi.uploader = uploader as any;
    return umi;
  },
});

function createFilebaseClient(options: FilebaseUploaderOptions): any {
  const token = options.token || process.env.FILEBASE_IPFS_KEY;
  if (!token) {
    throw new Error("No Filebase token provided");
  }

  return create({
    url: options.url || "https://rpc.filebase.io",
    headers: { Authorization: `Bearer ${token}` },
  });
}

function createFilebaseUploader(
  client: any,
  options: FilebaseUploaderOptions
): any {
  const gateway = options.gateway || "https://ipfs.filebase.io/ipfs";

  const upload = async (files: any[]) => {
    const uris: string[] = [];

    for (const file of files) {
      const uploadOptions = {
        pin: true,
      };

      const buffer = Buffer.from(file.buffer);
      const result = await client.add(buffer, uploadOptions);
      const uri = `${gateway}/${result.cid.toString()}`;
      uris.push(uri);
    }

    return uris;
  };

  const uploadJson = async (json: any) => {
    const buffer = Buffer.from(JSON.stringify(json));
    const file = createGenericFile(buffer, "metadata.json", {
      contentType: "application/json",
    });
    const [uri] = await upload([file]);
    return uri;
  };

  const uploadMetadata = async (metadata: any) => {
    if (metadata.image) {
      const file = metadata.image;
      const [uri] = await upload([file]);
      metadata.image = uri;
      if (metadata.properties && metadata.properties.files && metadata.properties.files[0]) {
        metadata.properties.files[0].uri = uri;
      }
    }
    return uploadJson(metadata);
  };

  const getUploadPrice = async () => {
    // For Filebase, we don't need to calculate a price as it's based on subscription
    return { basisPoints: BigInt(0), identifier: 'SOL' };
  };

  return { upload, uploadJson, uploadMetadata, getUploadPrice };
}