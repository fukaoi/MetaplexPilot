import {
  mintV2,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey } from "@solana/web3.js";
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  Umi,
  assertAccountExists,
  deserializeAccount,
  keypairIdentity,
  none,
  publicKey,
  some,
  transactionBuilder,
  Account,
} from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { filebaseUploader } from "./filebase-uploader";
import bs from "bs58";
import dotenv from "dotenv";
import { BN } from "bn.js";

export function getLeafAssetId(tree: string, leafIndex: number): PublicKey {
  const idxLE8 = (
    BN.isBN(leafIndex) ? leafIndex : new BN(leafIndex)
  ).toArrayLike(Buffer, "le", 8);

  const [assetPk] = PublicKey.findProgramAddressSync(
    [new PublicKey(tree).toBuffer(), idxLE8],
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  );

  return assetPk;
}

async function getNextLeafIndex(umi: Umi, treePk: string): Promise<number> {
  const raw = await umi.rpc.getAccount(publicKey(treePk));
  assertAccountExists(raw);
  const { data: tree } = deserializeAccount(
    raw,
    ConcurrentMerkleTreeAccountData,
  ) as Account<ConcurrentMerkleTreeAccountData>;

  // ❷ SDK v5 以降はメソッドが用意されている
  return Number(tree.getNumMinted());
}

export const mintBubblegumNft = async ({
  treeId,
  collection,
  metadata,
}: {
  treeId: string;
  collection: string;
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    sellerFeeBasisPoints: number;
    creators: any[];
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
  const v2Collection = some(publicKey(collection));
  // const v2Collection = null;

  // const v2Metadata = { ...metadata, collection: v2Collection };
  const v2Metadata = { ...metadata, collection: null };
  const nextIdx = await getNextLeafIndex(umi, treeId);
  console.log("asset id: ", nextIdx);

  // const CU_LIMIT = 200_000;
  // const PRIO_FEE = await umi.rpc.getPriorityFeeEstimate();

  // const tx = transactionBuilder()
  //   .add(setComputeUnitLimit(umi, { units: CU_LIMIT }))
  //   .add(setComputeUnitPrice(umi, { microLamports: PRIO_FEE }));

  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey(treeId),
    // coreCollection: publicKey(collection),
    metadata: v2Metadata,
  }).sendAndConfirm(umi, {
    send: { skipPreflight: true, maxRetries: 3 },
    // confirm: { commitment: "finalized" },
  });
  const assetId = getLeafAssetId(treeId, nextIdx);
  console.log(nextIdx, assetId.toString());
  return assetId.toString();
  // return await parseLeafFromMintV2Transaction(umi, signature);
};
