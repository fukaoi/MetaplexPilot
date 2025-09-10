import { mintV2 } from "@metaplex-foundation/mpl-bubblegum";
import {
  createGenericFile,
  publicKey,
  some,
  transactionBuilder,
  Umi,
} from "@metaplex-foundation/umi";
import { filebaseUploader } from "./filebase-uploader";
import fs from "fs";
import path from "path";
import { parseLeafFromMintV2ConfirmedTransaction } from "./parseLeafFromMintV2ConfirmedTransaction";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";

const CU_LIMIT = 200_000;
const PRIO_FEE = 1000;

export const mintBubblegumV2Nft = async ({
  umi,
  treeId,
  collection,
  filePath,
  onChainMetadata,
  offChainMetadata,
  nftOwner,
}: {
  umi: Umi;
  treeId: string;
  collection?: string;
  filePath: string;
  onChainMetadata: {
    name: string;
    symbol: string;
    sellerFeeBasisPoints: number;
    creators: any[];
  };
  offChainMetadata?: {
    description: string;
    attributes?: any[];
    properties?: { [key: string]: unknown };
  };
  nftOwner?: string;
}) => {
  umi.use(
    filebaseUploader({
      gateway: "https://ipfs.filebase.io/ipfs",
    }),
  );

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const fileExtension = path.extname(fileName).toLowerCase();

  // Determine content type based on file extension
  let contentType = "application/octet-stream"; // default
  switch (fileExtension) {
    case ".mp4":
      contentType = "video/mp4";
      break;
    case ".jpg":
    case ".jpeg":
      contentType = "image/jpeg";
      break;
    case ".png":
      contentType = "image/png";
      break;
    case ".gif":
      contentType = "image/gif";
      break;
    case ".webp":
      contentType = "image/webp";
      break;
    case ".mov":
      contentType = "video/quicktime";
      break;
    case ".avi":
      contentType = "video/x-msvideo";
      break;
  }

  const fileToUpload = createGenericFile(new Uint8Array(fileBuffer), fileName, {
    displayName: fileName,
    uniqueName: fileName,
    contentType,
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
    seller_fee_basis_points: onChainMetadata.sellerFeeBasisPoints,
  };
  const jsonUrl = await umi.uploader.uploadJson(jsonMetadata);

  const metadata = {
    ...onChainMetadata,
    collection: collection ? some(publicKey(collection)) : null,
    uri: jsonUrl,
  };

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
    .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }))
    .add(
      mintV2(umi, {
        collectionAuthority: umi.identity,
        coreCollection: collection ? publicKey(collection) : undefined,
        leafOwner: nftOwner ? publicKey(nftOwner) : umi.identity.publicKey,
        payer: umi.identity,
        merkleTree: publicKey(treeId),
        metadata,
      }),
    );

  const { signature } = await tx.sendAndConfirm(umi, {
    send: { skipPreflight: true, maxRetries: 3 },
    confirm: { commitment: "confirmed" },
  });

  const response = await parseLeafFromMintV2ConfirmedTransaction(
    umi,
    signature,
  );
  return response.id;
};
