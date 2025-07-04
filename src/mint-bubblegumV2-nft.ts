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
}) => {
  umi.use(
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
    seller_fee_basis_points: onChainMetadata.sellerFeeBasisPoints,
  };
  const jsonUrl = await umi.uploader.uploadJson(jsonMetadata);

  const metadata = {
    ...onChainMetadata,
    collection: some(publicKey(collection)),
    uri: jsonUrl,
  };

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
    .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }))
    .add(
      mintV2(umi, {
        collectionAuthority: umi.identity,
        coreCollection: publicKey(collection),
        leafOwner: umi.identity.publicKey,
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
