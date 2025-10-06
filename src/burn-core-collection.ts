import { burnCollectionV1 } from "@metaplex-foundation/mpl-core";
import { publicKey, Umi, Signer, PublicKey } from "@metaplex-foundation/umi";
import bs from "bs58";

export const burnCoreCollection = async ({
  umi,
  collection,
  authority,
}: {
  umi: Umi;
  collection: string | PublicKey;
  authority?: Signer;
}) => {
  const collectionPublicKey =
    typeof collection === "string" ? publicKey(collection) : collection;

  const response = await burnCollectionV1(umi, {
    collection: collectionPublicKey,
    payer: umi.payer,
    authority: authority || umi.payer,
    compressionProof: null,
  }).sendAndConfirm(umi);

  return bs.encode(response.signature);
};
