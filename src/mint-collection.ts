import { generateSigner, keypairIdentity } from "@metaplex-foundation/umi";
import { createCollection, mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import dotenv from "dotenv";

(async () => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL).use(mplCore());
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));

  console.log("# Create collection nft");

  const collection = generateSigner(umi);
  await createCollection(umi, {
    collection,
    name: "Core Collection",
    uri: "https://arweave.net/cSCP0h2n1crjeSWE9KF-XtLciJalDNFs7Vf-Sm0NNY0",
  }).sendAndConfirm(umi);

  console.log("Collection address:", collection.publicKey);
})();
