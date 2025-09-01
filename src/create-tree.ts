import { generateSigner, Umi } from "@metaplex-foundation/umi";
import { createTreeV2 } from "@metaplex-foundation/mpl-bubblegum";

export const createTree = async ({
  umi,
  maxDepth,
  maxBufferSize,
  canopyDepth,
}: {
  umi: Umi;
  maxDepth: number;
  maxBufferSize: number;
  canopyDepth?: number;
}) => {
  const merkleTree = generateSigner(umi);
  const builder = await createTreeV2(umi, {
    merkleTree,
    maxDepth,
    maxBufferSize,
    canopyDepth,
  });

  await builder.sendAndConfirm(umi);
  return merkleTree.publicKey.toString();
};
