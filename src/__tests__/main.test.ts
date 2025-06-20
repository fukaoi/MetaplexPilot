import { createTree } from "../create-tree";
import bs from "bs58";
import { expect, describe } from "@jest/globals";
import { fetchAssets } from "../fetch-assets";
import { mintBubblegumNft } from "../mint-bubblegum-nft";
import { filebaseUploader } from "../filebase-uploader";

describe("createTree", () => {
  it("should create a merkle tree", async () => {
    // minimum tree settings
    const merkleTree = await createTree({ maxDepth: 3, maxBufferSize: 8 });
    expect(merkleTree).toBeDefined();
    console.log("# sig: ", bs.encode(merkleTree.signature));
  });

  it("load filebaseUploader", async () => {
    const response = filebaseUploader();
    expect(response).toBeDefined();
  });

  it("fetch asset datas", async () => {
    const assetIds = [
      "651KHcodYkx8s2wFoHzZhL1TMfHa8WL1baBX6y4s5b3J",
      "6qrkGBuHKdGY2P1bAyV6BehC3byjkku7oCYgfwJuMe7u",
      "9h1Tz6M4G2PTCqAeg8j22rn1BHjknHymY9reZmwig12M",
    ];
    const response = await fetchAssets(assetIds);
    expect(response).toBeDefined();
    console.log(
      "# metadata: ",
      response.map((data: any) => data.content.metadata),
    );
  });

  it("should mint bubblegum nft", async () => {
    const treeId = "5uNBcLcmjzimdYo7WfVKbpmfJzbVAUKkKeaZH4NJSoTG";
    const metadata = {
      name: "Coupon",
      symbol: "CNFT",
      uri: "https://ipfs.filebase.io/ipfs/QmexzhzMDpFTZhHeaWG12QchvBUCYz9hGxu6Xb1rNy72FK",
      sellerFeeBasisPoints: 0,
      creators: [],
    };
    const collection = "8rDXuza4QhaA7mG5nDyx3kBKUbwdcDr3MKqTcZL7fuvK";
    const response = await mintBubblegumNft({ treeId, collection, metadata });
    expect(response).toBeDefined();
    console.log("# assetId: ", response);
  });

  // it("should mint core nft", async () => {
  //   const treeId = "5uNBcLcmjzimdYo7WfVKbpmfJzbVAUKkKeaZH4NJSoTG";
  //   const metadata = {
  //     name: "Coupon3",
  //     symbol: "CouponNFT3",
  //     uri: "https://ipfs.filebase.io/ipfs/QmexzhzMDpFTZhHeaWG12QchvBUCYz9hGxu6Xb1rNy72FK",
  //     sellerFeeBasisPoints: 0,
  //     collection: "", // todo
  //     creators: [],
  //   };
  //   const response = await mintBubblegumNft({ treeId, metadata });
  //   expect(response).toBeDefined();
  //   console.log("# assetId: ", response.id);
  // });
});
