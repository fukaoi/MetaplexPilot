import { generateSigner, Umi } from "@metaplex-foundation/umi";
import bs from "bs58";
import { createTreeV2 } from "@metaplex-foundation/mpl-bubblegum";

export const createTree = async ({
  umi,
  maxBufferSize,
  maxDepth,
}: {
  umi: Umi;
  maxBufferSize: number;
  maxDepth: number;
}) => {
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const merkleTree = generateSigner(umi);
  const builder = await createTreeV2(umi, {
    merkleTree,
    maxBufferSize,
    maxDepth,
  });

  await builder.sendAndConfirm(umi);
  return merkleTree.publicKey.toString();
};
