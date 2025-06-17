import {
  mintV2,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  keypairIdentity,
  none,
  publicKey,
  some,
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

  const v2Metadata = { ...metadata, collection: v2Collection };
  console.log("v2 Metadata: ", v2Metadata);
  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey(treeId),
    // collectionAuthority: umi.identity,
    coreCollection: publicKey(collection),
    metadata: v2Metadata,
  }).sendAndConfirm(umi);

  const { blockhash, lastValidBlockHeight } = await umi.rpc.getLatestBlockhash({
    commitment: "finalized",
  });

  await umi.rpc.confirmTransaction(signature, {
    commitment: "confirmed",
    strategy: {
      type: "blockhash",
      blockhash,
      lastValidBlockHeight,
    },
  });
  return await parseLeafFromMintV2Transaction(umi, signature);
};
