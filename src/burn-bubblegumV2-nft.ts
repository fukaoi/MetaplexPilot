import { burnV2, getAssetWithProof } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey, Umi } from "@metaplex-foundation/umi";
import bs from "bs58";

export const burnBubblegumV2Nft = async ({
  umi,
  assetId,
  collection,
  leafOwner,
}: {
  umi: Umi;
  assetId: string;
  collection?: string;
  leafOwner: string;
}) => {
  const assetWithProof = await getAssetWithProof(umi, publicKey(assetId));
  const coreCollection = collection ? publicKey(collection) : undefined;

  const response = await burnV2(umi, {
    ...assetWithProof,
    leafOwner: publicKey(leafOwner),
    coreCollection,
  }).sendAndConfirm(umi);

  return bs.encode(response.signature);
};
