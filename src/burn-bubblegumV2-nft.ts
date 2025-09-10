import { burnV2, getAssetWithProof } from "@metaplex-foundation/mpl-bubblegum";
import { publicKey, Umi, Signer, PublicKey } from "@metaplex-foundation/umi";
import bs from "bs58";

export const burnBubblegumV2Nft = async ({
  umi,
  assetId,
  collection,
  leafOwner,
  authority,
}: {
  umi: Umi;
  assetId: string;
  collection?: string;
  leafOwner: string | PublicKey;
  authority?: Signer;
}) => {
  const assetWithProof = await getAssetWithProof(
    umi as any,
    publicKey(assetId),
  );

  const response = await burnV2(umi, {
    ...assetWithProof,
    payer: umi.payer,
    leafOwner: typeof leafOwner === "string" ? publicKey(leafOwner) : leafOwner,
    authority: authority || umi.payer,
    coreCollection: collection ? publicKey(collection) : undefined,
  }).sendAndConfirm(umi);

  return bs.encode(response.signature);
};
