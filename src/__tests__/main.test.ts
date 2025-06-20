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
    const filePath = "./assets/hokke.jpeg";
    const onChainMetadata = {
      name: "CouponNFT",
      symbol: "CPN",
      uri: "",
      sellerFeeBasisPoints: 0,
      creators: [],
    };
    const offChainMetadata = {
      description: "This is a coupon NFT",
      attributes: [
        {
          trait_type: "Color",
          value: "Clear Yellow",
        },
        {
          trait_type: "Eye",
          value: "Orange",
        },
        { trait_type: "Sticker", value: "Galaxy Blue" },
      ],
    };

    const collection = "8rDXuza4QhaA7mG5nDyx3kBKUbwdcDr3MKqTcZL7fuvK";
    const response = await mintBubblegumNft({
      treeId,
      filePath,
      collection,
      onChainMetadata: onChainMetadata,
      offChainMetadata,
    });
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
  //   properties: {
  //   files: [{ uri: imageUri, type: "image/png" }],
  //   category: "image",
  // }
  //   const metadata = {
  //       name: "Number #0001",
  //       description:
  //         "Collection of 10 numbers on the blockchain. This is the number 1/10.",
  //       image: imageUri,
  //       external_url: "https://example.com",
  //       jues: [
  //         { trait_type: "rarity", value: "common" },
  //         { trait_type: "series", value: "1" },
  //       ],
  //   const response = await mintBubblegumNft({ treeId, metadata });
  //   expect(response).toBeDefined();
  //   console.log("# assetId: ", response.id);
  // });
});
