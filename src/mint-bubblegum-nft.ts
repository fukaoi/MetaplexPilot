import {
  mintV2,
  parseLeafFromMintV2Transaction,
} from "@metaplex-foundation/mpl-bubblegum";
import { keypairIdentity, none, publicKey } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import bs from "bs58";
import dotenv from "dotenv";

(async () => {
  console.log("# start bubblegum v2 ...");
  dotenv.config();
  const umi = createUmi(process.env.RPC_URL).use(mplCore());
  const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
  const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
  umi.use(keypairIdentity(owner));
  const { signature } = await mintV2(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: publicKey("5uNBcLcmjzimdYo7WfVKbpmfJzbVAUKkKeaZH4NJSoTG"),
    metadata: {
      name: "Coupon3",
      symbol: "CouponNFT3",
      uri: "https://ipfs.filebase.io/ipfs/QmexzhzMDpFTZhHeaWG12QchvBUCYz9hGxu6Xb1rNy72FK",
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          share: 100,
        },
      ],
    },
  }).sendAndConfirm(umi);

  const leaf = await parseLeafFromMintV2Transaction(umi, signature);
  console.log("# bubblegum v2 asset id: ", leaf.id);
})();
