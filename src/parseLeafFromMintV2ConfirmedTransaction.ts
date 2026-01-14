import {
  getLeafSchemaSerializer,
  MPL_BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  Context,
  PublicKey,
  TransactionSignature,
} from "@metaplex-foundation/umi";

export type LeafSchema =
  | {
      __kind: "V1";
      id: PublicKey;
      owner: PublicKey;
      delegate: PublicKey;
      nonce: bigint;
      dataHash: Uint8Array;
      creatorHash: Uint8Array;
    }
  | {
      __kind: "V2";
      id: PublicKey;
      owner: PublicKey;
      delegate: PublicKey;
      nonce: bigint;
      dataHash: Uint8Array;
      creatorHash: Uint8Array;
      collectionHash: Uint8Array;
      assetDataHash: Uint8Array;
      flags: number;
    };

export async function parseLeafFromMintV2ConfirmedTransaction(
  context: Pick<Context, "programs" | "eddsa" | "rpc">,
  signature: TransactionSignature,
): Promise<LeafSchema> {
  const MAX_ATTEMPTS = 5;
  const SLEEP_MS = 300;
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));
  let transaction = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const commitment = attempt === MAX_ATTEMPTS - 1 ? "finalized" : "confirmed";
    transaction = await context.rpc.getTransaction(signature, {
      commitment,
    });
    if (transaction) {
      break;
    }

    const backoffMs = SLEEP_MS * (attempt + 2);
    await sleep(backoffMs);
  }
  if (!transaction) {
    throw new Error("Could not get transaction from signature");
  }

  const instruction = transaction.message.instructions[2];
  const collectionIndex = instruction.accountIndexes[7];
  const collection = transaction.message.accounts[collectionIndex];

  if (!collection) {
    throw new Error("Collection account at index 7 is missing");
  }

  const programId = context.programs.getPublicKey(
    "mplBubblegum",
    MPL_BUBBLEGUM_PROGRAM_ID,
  );

  const instructionIndex = collection === programId ? 0 : 1;
  const { innerInstructions } = transaction.meta;
  if (innerInstructions) {
    const leaf = getLeafSchemaSerializer().deserialize(
      innerInstructions[0].instructions[instructionIndex].data.slice(8),
    );
    return leaf[0];
  }

  throw new Error("Could not parse leaf from transaction");
}
