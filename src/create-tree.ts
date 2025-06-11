import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import { createTreeV2 } from "@metaplex-foundation/mpl-bubblegum";
import dotenv from "dotenv";

export const createTree = async ({
  maxBufferSize,
  maxDepth,
}: {
  maxBufferSize: number;
  maxDepth: number;
}) => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL);
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));
  const merkleTree = generateSigner(umi);
  const builder = await createTreeV2(umi, {
    merkleTree,
    maxBufferSize,
    maxDepth,
  });

  return await builder.sendAndConfirm(umi);
};
