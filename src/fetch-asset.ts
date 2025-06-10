import dotenv from "dotenv";
dotenv.config();

const options = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: '{"jsonrpc":"2.0","id":"1","method":"getAssetBatch","params":{"ids":["651KHcodYkx8s2wFoHzZhL1TMfHa8WL1baBX6y4s5b3J","6qrkGBuHKdGY2P1bAyV6BehC3byjkku7oCYgfwJuMe7u","9h1Tz6M4G2PTCqAeg8j22rn1BHjknHymY9reZmwig12M"]}}',
};

fetch(process.env.RPC_URL, options)
  .then((response) => response.json())
  .then((response) =>
    console.log(response.result.map((asset) => asset.content)),
  )
  .catch((err) => console.error(err));
