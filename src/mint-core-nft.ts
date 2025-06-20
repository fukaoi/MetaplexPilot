import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { filebaseUploader } from "./filebase-uploader.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import fs from "node:fs";
import path from "node:path";
import { base58 } from "@metaplex-foundation/umi/serializers";
import dotenv from "dotenv";

export const mintCoreNft = async ({
  collection,
  filePath,
  onChainMetadata,
  offChainMetadata,
}: {
  collection: string;
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
    properties?: any[];
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

  const imageBuffer = fs.readFileSync(
    path.join(__dirname, "../assets/hokke.jpeg"),
  );

  const imageFile = createGenericFile(imageBuffer, "nfc.png");
  const [imageUri] = await umi.uploader.upload([imageFile]);

,
  };
  const metadataUri = await umi.uploader.uploadJson(metadata);
  const asset = generateSigner(umi);
  const tx = await create(umi, {
    asset,
    name: "Core NFT",
    uri: metadataUri,
  }).sendAndConfirm(umi);
  return base58.deserialize(tx.signature)[0];
};
