import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore, fetchCollection } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import dotenv from "dotenv";

(async () => {
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL).use(mplCore());

  const collectionPk = publicKey(
    "7XEYbxe1g7PctWozFfHKkWMQn3jMg3KUip4kTZsmAtaM",
  );
  const col = await fetchCollection(umi, collectionPk);

  console.log("col:", col);
  console.log("updateAuthority:", col.updateAuthority);
})();
