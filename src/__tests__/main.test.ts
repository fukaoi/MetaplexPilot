import { createTree } from "../create-tree";
import bs from "bs58";
import dotenv from "dotenv";
import { expect, describe } from "@jest/globals";
import { fetchAssets } from "../fetch-assets";
import { mintBubblegumNft } from "../mint-bubblegum-nft";
import { filebaseUploader } from "../filebase-uploader";
import { mintCoreCollection } from "../mint-core-collection";
import {
  amountToNumber,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { burnBubblegumNft } from "../burn-bubblegum-nft";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

let umi: ReturnType<typeof createUmi>;
const treeId = "5uNBcLcmjzimdYo7WfVKbpmfJzbVAUKkKeaZH4NJSoTG";
const collection = "DWLXzmL1iN8SEeUaqZbauGZHN4ivAqk3Wogpm1Lv1XmY";

describe("createTree", () => {
  beforeAll(async () => {
    dotenv.config();
    umi = createUmi(process.env.RPC_URL).use(mplCore());
    const secretKeyBytes = bs.decode(process.env.SECRET_KEY);
    const owner = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes);
    umi.use(keypairIdentity(owner));
    umi.use(dasApi());
  });

  it("should create a merkle tree", async () => {
    // minimum tree settings
    const merkleTree = await createTree({ umi, maxDepth: 3, maxBufferSize: 8 });
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

    const response = await mintBubblegumNft({
      umi,
      treeId,
      filePath,
      collection,
      onChainMetadata,
      offChainMetadata,
    });
    expect(response).toBeDefined();
    console.log("# assetId: ", response);
  });

  it("should mint core collection", async () => {
    const filePath = "./assets/coupon.png";
    const onChainMetadata = {
      name: "Coupon Collection",
      symbol: "COLL",
      sellerFeeBasisPoints: 0,
      creators: [],
    };

    const offChainMetadata = {
      description:
        "Collection of 10 numbers on the blockchain. This is the number 1/10.",
    };
    const response = await mintCoreCollection({
      umi,
      filePath,
      onChainMetadata,
      offChainMetadata,
    });
    expect(response).toBeDefined();
    console.log("# collection: ", response);
  });

  it("burn bubblegum nft", async () => {
    const rpcAssetList = await umi.rpc.searchAssets({
      owner: publicKey(process.env.PUBLIC_KEY),
      compressed: true,
      burnt: false,
    });
    const items = rpcAssetList.items[0];
    const assetId = items.id;

    const response = await burnBubblegumNft({
      umi,
      assetId,
      treeOwner: process.env.PUBLIC_KEY,
      collection,
    });
    expect(response).toBeDefined();
    console.log("# signature: ", response);
  });
});
