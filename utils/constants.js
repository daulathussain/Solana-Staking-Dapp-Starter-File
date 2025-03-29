import { clusterApiUrl, PublicKey } from "@solana/web3.js";

const CONTRACT_PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID;
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS;
const ADMIN = process.env.NEXT_PUBLIC_ADMIN;
const ACTIVE_NETWORK = process.env.NEXT_PUBLIC_ACTIVE_NETWORK;
const MAINNET_RPC_URL = process.env.NEXT_PUBLIC_MAINNET_RPC_URL;

// Program and token addresses
export const PROGRAM_ID = new PublicKey(CONTRACT_PROGRAM_ID);
export const TOKEN_MINT = new PublicKey(TOKEN_ADDRESS);
export const REWARD_MINT = new PublicKey(TOKEN_ADDRESS);
export const ADMIN_WALLET = new PublicKey(ADMIN);

let endpoint;
if (ACTIVE_NETWORK === "mainnet-beta") {
  endpoint = MAINNET_RPC_URL;
} else {
  endpoint = clusterApiUrl("devnet");
}

// RPC endpoint - use devnet for testing
// export const NETWORK = clusterApiUrl("devnet");
export const NETWORK = endpoint;
export const CONNECTION_CONFIG = {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000, // 1 minute
  disableRetryOnRateLimit: false,
};

// Seeds for PDAs
export const STAKING_POOL_SEED = Buffer.from("staking_pool");
export const USER_STAKE_SEED = Buffer.from("user_stake");

// Other constants
export const LAMPORTS_PER_SOL = 1000000000;
export const TOKEN_DECIMALS = 9; // Adjust based on your token's decimals
