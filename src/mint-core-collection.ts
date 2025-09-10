import { createCollection } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  transactionBuilder,
  Umi,
  publicKey,
} from "@metaplex-foundation/umi";
import { filebaseUploader } from "./filebase-uploader";
import fs from "fs";
import path from "path";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";
import dotenv from "dotenv";

const CU_LIMIT = 200_000;
const PRIO_FEE = 1000;

export const mintCoreCollection = async ({
  umi,
  filePath,
  onChainMetadata,
  offChainMetadata,
  burnDelegate,
}: {
  umi: Umi;
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
  burnDelegate?: string;
}) => {
  dotenv.config();
  umi.use(
    filebaseUploader({
      gateway: "https://ipfs.filebase.io/ipfs",
    }),
  );

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileToUpload = createGenericFile(new Uint8Array(fileBuffer), fileName, {
    displayName: fileName,
    uniqueName: fileName,
    contentType: "application/octet-stream",
    tags: [],
  });

  const [imageUrl] = await umi.uploader.upload([fileToUpload]);
  const jsonMetadata = {
    name: onChainMetadata.name,
    symbol: onChainMetadata.symbol,
    description: offChainMetadata?.description || "",
    image: imageUrl,
    attributes: offChainMetadata?.attributes || [],
    properties: offChainMetadata?.properties || [],
  };
  const jsonUrl = await umi.uploader.uploadJson(jsonMetadata);
  const collection = generateSigner(umi);

  const plugins: any[] = [{ type: "BubblegumV2" as const }];

  if (burnDelegate) {
    plugins.push({
      type: "PermanentBurnDelegate" as const,
      authority: { type: "Address" as const, address: publicKey(burnDelegate) },
    });
  }

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
    .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }))
    .add(
      createCollection(umi, {
        collection,
        name: onChainMetadata.name,
        uri: jsonUrl,
        plugins,
      }),
    );

  await tx.sendAndConfirm(umi, {
    send: { skipPreflight: true, maxRetries: 3 },
    confirm: { commitment: "confirmed" },
  });
  return collection.publicKey;
};
