import { mplCore, createCollection } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { filebaseUploader } from "./filebase-uploader";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import fs from "node:fs";
import path from "node:path";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";

import dotenv from "dotenv";
import { symlink } from "node:fs/promises";

const CU_LIMIT = 200_000;
const PRIO_FEE = 1000;

export const mintCoreCollection = async ({
  filePath,
  onChainMetadata,
  offChainMetadata,
}: {
  filePath: string;
  onChainMetadata: {
    name: string;
    symbol: string;
  };
  offChainMetadata?: {
    description: string;
    attributes?: any[];
    properties?: { [key: string]: unknown };
  };
}) => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL)
    .use(mplCore())
    .use(
      filebaseUploader({
        gateway: "https://ipfs.filebase.io/ipfs",
      }),
    );

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileToUpload = createGenericFile(fileBuffer, fileName, {
    displayName: fileName,
    uniqueName: fileName,
    contentType: "application/octet-stream",
    tags: [],
  });

  const [imageUrl] = await umi.uploader.upload([fileToUpload]);
  const jsonMetadata = {
    name: onChainMetadata.name,
    symbol: onChainMetadata.symbol,
    description: offChainMetadata.description,
    image: imageUrl,
    attributes: offChainMetadata.attributes || [],
    properties: offChainMetadata.properties || [],
  };
  const jsonUrl = await umi.uploader.uploadJson(jsonMetadata);

  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));
  const collection = generateSigner(umi);

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
    .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }))
    .add(
      createCollection(umi, {
        collection,
        name: onChainMetadata.name,
        uri: jsonUrl,
      }),
    );

  const { signature } = await tx.sendAndConfirm(umi, {
    send: { skipPreflight: true, maxRetries: 3 },
    confirm: { commitment: "confirmed" },
  });
  return base58.deserialize(signature)[0];
};
