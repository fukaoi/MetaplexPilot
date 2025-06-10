import { create, mplCore } from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import fs from "node:fs";
import path from "node:path";
import { base58 } from "@metaplex-foundation/umi/serializers";
import dotenv from "dotenv";

console.log("# start core nft minting...");

(async () => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URLj)
    .use(mplCore())
    .use(
      irysUploader({
        address: "https://devnet.irys.xyz",
      }),
    );

  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  console.log("# owner: ", owner);
  umi.use(keypairIdentity(owner));

  const imageBuffer = fs.readFileSync(
    path.join(__dirname, "../assets/hokke.jpeg"),
  );

  const imageFile = createGenericFile(imageBuffer, "nfc.png");
  const [imageUri] = await umi.uploader.upload([imageFile]);

  // const imageUri = "";
  console.log("# image url:", imageUri);

  // Upload metadata JSON
  const metadata = {
    name: "Number #0001",
    description:
      "Collection of 10 numbers on the blockchain. This is the number 1/10.",
    image: imageUri,
    external_url: "https://example.com",
    jues: [
      { trait_type: "rarity", value: "common" },
      { trait_type: "series", value: "1" },
    ],
    properties: {
      files: [{ uri: imageUri, type: "image/png" }],
      category: "image",
    },
  };
  const metadataUri = await umi.uploader.uploadJson(metadata);
  console.log("# upload metadata url:", metadataUri);

  // Mint core nft
  const asset = generateSigner(umi);
  console.log("# Creating Core NFT...");
  const tx = await create(umi, {
    asset,
    name: "Core NFT",
    uri: metadataUri,
  }).sendAndConfirm(umi);
  const sig = base58.deserialize(tx.signature)[0];
  console.log("# tx sig: ", sig);
})();
