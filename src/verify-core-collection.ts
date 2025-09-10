import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, fetchCollection } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import dotenv from "dotenv";

(async () => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL!).use(mplCore());

  const collectionPk = publicKey(
    "8Wf4oHjf1CV1UBzFsJ6F9ETqRmx4WAqJzariyAAVxX9h",
  );
  const col = await fetchCollection(umi, collectionPk);

  console.log("col:", col);
  console.log("updateAuthority:", col.updateAuthority);
})();
