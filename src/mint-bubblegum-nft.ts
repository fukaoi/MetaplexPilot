import {
  mintV2,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  keypairIdentity,
  none,
  publicKey,
  some,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { filebaseUploader } from "./filebase-uploader";
import bs from "bs58";
import dotenv from "dotenv";

export const mintBubblegumNft = async ({
  treeId,
  collection,
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
  const v2Collection = some(publicKey(collection));
  // const v2Collection = null;

  // const v2Metadata = { ...metadata, collection: v2Collection };
  const v2Metadata = { ...metadata, collection: null };
  console.log("v2 Metadata: ", v2Metadata);

  // const CU_LIMIT = 200_000;
  // const PRIO_FEE = await umi.rpc.getPriorityFeeEstimate();

  // const tx = transactionBuilder()
  //   .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
  //   .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }));

  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey(treeId),
    // coreCollection: publicKey(collection),
    metadata: v2Metadata,
  }).sendAndConfirm(umi, {
    send: { skipPreflight: true, maxRetries: 5 },
    confirm: { commitment: "finalized" },
  });
  return await parseLeafFromMintV2Transaction(umi, signature);
};
