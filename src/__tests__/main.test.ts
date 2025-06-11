import { createTree } from "../create-tree";
import bs from "bs58";
import { expect, describe } from "@jest/globals";
import { fetchAssets } from "../fetch-assets";

describe("createTree", () => {
  it("should create a merkle tree", async () => {
    // minimum tree settings
    const merkleTree = await createTree({ maxDepth: 3, maxBufferSize: 8 });
    expect(merkleTree).toBeDefined();
    console.log("# sig: ", bs.encode(merkleTree.signature));
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
});
