import { createTree } from "../create-tree";
import bs from "bs58";
import dotenv from "dotenv";
import { expect, describe } from "@jest/globals";
import { mintBubblegumV2Nft } from "../mint-bubblegumV2-nft";
import { filebaseUploader } from "../filebase-uploader";
import { mintCoreCollection } from "../mint-core-collection";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { burnBubblegumV2Nft } from "../burn-bubblegumV2-nft";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import {
  fetchTreeConfigFromSeeds,
  Version,
} from "@metaplex-foundation/mpl-bubblegum";

let umi: ReturnType<typeof createUmi>;
const treeV2Id = "CTvwtHvQHDiDp1aWy8Rk4ThuzmC6jgZPFaFv2Qu82Yaa";
const collection = "DWLXzmL1iN8SEeUaqZbauGZHN4ivAqk3Wogpm1Lv1XmY";

describe("Metaplex Pilots", () => {
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
    const merkleTree = await createTree({
      umi,
      maxDepth: 3,
      maxBufferSize: 8,
    });
    expect(merkleTree).toBeDefined();
    console.log("# treeId: ", merkleTree);
  });

  it("Verify filebaseUploader", async () => {
    const response = filebaseUploader();
    expect(response).toBeDefined();
  });

  it("Verify tree version", async () => {
    const treeConfig = await fetchTreeConfigFromSeeds(umi, {
      merkleTree: publicKey(treeV2Id),
    });
    expect(treeConfig.version).toBe(Version.V2);
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

    const response = await mintBubblegumV2Nft({
      umi,
      treeId: treeV2Id,
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

  it("Verify core collection", async () => {
    const asset = await umi.rpc.getAsset(publicKey(collection));
    expect(asset.interface).toBe("MplCoreCollection");
    const children = await umi.rpc.getAssetsByGroup({
      groupKey: "collection",
      groupValue: collection,
    });

    const collections = children.items.map((item) => {
      return {
        assetId: item.id,
        interface: item.interface,
        compression: item.compression.compressed,
        burned: item.burnt,
      };
    });
    console.log("# collections: ", collections);
  });

  it("burn bubblegum nft", async () => {
    const rpcAssetList = await umi.rpc.searchAssets({
      owner: publicKey(process.env.PUBLIC_KEY),
      grouping: ["collection", collection],
      compressed: true,
      burnt: false, // disable burned nft
    });
    console.log("# asset list: ", rpcAssetList.items);
    expect(rpcAssetList.items.length).toBeGreaterThan(0);
    const items = rpcAssetList.items[0];
    const assetId = items.id;
    console.log("asset':", assetId);

    const response = await burnBubblegumV2Nft({
      umi,
      assetId,
      treeOwner: process.env.PUBLIC_KEY,
      collection,
    });
    expect(response).toBeDefined();
    console.log("# signature: ", response);
  });
});
