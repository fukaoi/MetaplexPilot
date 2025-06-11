# Metaplex Pilot Code

## Overview
This project demonstrates how to mint NFTs on Solana using the Metaplex Framework with Filebase for decentralized storage.

## Features
- Core NFT minting using Metaplex Core
- Compressed NFT minting using Bubblegum
- Filebase IPFS integration for decentralized storage
- Asset retrieval and management

## Prerequisites
- Node.js v16+
- pnpm package manager
- Solana CLI tools
- A Filebase account with an IPFS API key

## Setup
1. Clone the repository
2. Install dependencies with `pnpm install`
3. Create a `.env` file with the following variables:
   ```
   SECRET_KEY=your_wallet_private_key
   RPC_URL=your_rpc_endpoint
   FILEBASE_IPFS_KEY=your_filebase_api_key
   ```

## Usage

## Storage Options
This project can use either:
- **Filebase** (default): Decentralized storage on IPFS
- **Irys**: Alternative storage option (see legacy code)

## Implementation Details
The Filebase uploader is implemented as a UMI plugin that replaces the default Irys uploader. This integration enables direct uploads to Filebase's IPFS nodes with the same ease of use as the built-in uploaders.
