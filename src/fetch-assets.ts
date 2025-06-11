import dotenv from "dotenv";
dotenv.config();

export const fetchAssets = async (assetIds: string[]) => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "1",
      method: "getAssetBatch",
      params: { ids: assetIds },
    }),
  };

  const response = await fetch(process.env.RPC_URL, options);
  const data = await response.json();
  return data.result;
};
