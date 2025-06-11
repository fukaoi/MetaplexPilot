import {
  mintV2,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { keypairIdentity, none, publicKey } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { filebaseUploader } from "./filebase-uploader.js";
import bs from "bs58";
import dotenv from "dotenv";

export const mintBubblegumNft = async ({
  treeId,
  metadata,
}: {
  treeId: string;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    collection: any;
    creators: any[];
  };
}) => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL)
    .use(mplCore())
    .use(
      filebaseUploader({
        gateway: "https://ipfs.filebase.io/ipfs",
      })
    );
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));
  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey(treeId),
    metadata,
  }).sendAndConfirm(umi);

  return await parseLeafFromMintV2Transaction(umi, signature);
};
