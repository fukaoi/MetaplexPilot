import { create } from "kubo-rpc-client";
import { readFileSync } from "node:fs";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const ipfs = create({
    url: "https://rpc.filebase.io",
    headers: { Authorization: `Bearer ${process.env.FILEBASE_IPFS_KEY}` },
  });
  const file = readFileSync("./assets/coupon.png");
  const result = await ipfs.add(file);
  console.log("# CID:", result);
  console.log(`https://ipfs.filebase.io/ipfs/${result.cid}`);
})();
