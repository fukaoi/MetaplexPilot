import { burnV2, getAssetWithProof } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey, Umi } from "@metaplex-foundation/umi";
import bs from "bs58";

export const burnBubblegumNft = async ({
  umi,
  assetId,
  collection,
  treeOwner,
}: {
  umi: Umi;
  assetId: string;
  collection?: string;
  treeOwner: string;
}) => {
  const assetWithProof = await getAssetWithProof(umi, publicKey(assetId), {
    truncateCanopy: true,
  });
  const coreCollection = collection ? publicKey(collection) : undefined;

  const response = await burnV2(umi, {
    ...assetWithProof,
    leafOwner: publicKey(treeOwner),
    coreCollection,
  }).sendAndConfirm(umi);
  return bs.encode(response.signature);
};
