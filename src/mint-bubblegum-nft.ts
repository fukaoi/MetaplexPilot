import { mintV2 } from "@metaplex-foundation/mpl-bubblegum";
import {
  keypairIdentity,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { filebaseUploader } from "./filebase-uploader";
import bs from "bs58";
import dotenv from "dotenv";
import { parseLeafFromMintV2ConfirmedTransaction } from "./parseLeafFromMintV2ConfirmedTransaction";
import {
  setComputeUnitLimit,
  setComputeUnitPrice,
} from "@metaplex-foundation/mpl-toolbox";

const CU_LIMIT = 200_000;
const PRIO_FEE = 1000;

export const mintBubblegumNft = async ({
  treeId,
  metadata,
}: {
  treeId: string;
  collection: string;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: any[];
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
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));
  // Remove the unused v2Collection variable
  // const v2Collection = some(publicKey(collection));
  // const v2Collection = null;

  // const v2Metadata = { ...metadata, collection: v2Collection };
  const v2Metadata = { ...metadata, collection: null };

  const tx = transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
    .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }))
    .add(
      mintV2(umi, {
        leafOwner: umi.identity.publicKey,
        merkleTree: publicKey(treeId),
        // coreCollection: publicKey(collection),
        metadata: v2Metadata,
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
