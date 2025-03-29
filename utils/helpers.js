import { PublicKey } from "@solana/web3.js";
import { TOKEN_DECIMALS } from "./constants";

// Format token amount for display
export const formatTokenAmount = (amount, decimals = TOKEN_DECIMALS) => {
  if (!amount) return "0";
  return (amount / Math.pow(10, decimals)).toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  });
};

// Truncate wallet address for display
export const shortenAddress = (address, chars = 4) => {
  if (!address) return "";
  const pubKey = address.toString();
  return `${pubKey.slice(0, chars)}...${pubKey.slice(-chars)}`;
};

// Find PDA address for staking pool
export const findStakingPoolAddress = async (programId, tokenMint) => {
  const [poolAddress] = await PublicKey.findProgramAddressSync(
    [Buffer.from("staking_pool"), tokenMint.toBuffer()],
    programId
  );
  return poolAddress;
};

// Find PDA address for user stake account
export const findUserStakeAddress = async (programId, userPubkey) => {
  const [userStakeAddress] = await PublicKey.findProgramAddressSync(
    [Buffer.from("user_stake"), userPubkey.toBuffer()],
    programId
  );
  return userStakeAddress;
};

// Calculate APY based on reward rate and total staked
export const calculateAPY = (rewardRate, totalStaked) => {
  if (!totalStaked || totalStaked === 0) return 0;

  // Daily rewards: rewardRate * 86400 (seconds in a day)
  const dailyRewards = rewardRate * 86400;

  // Yearly rewards: dailyRewards * 365
  const yearlyRewards = dailyRewards * 365;

  // APY as percentage: (yearlyRewards / totalStaked) * 100
  return (yearlyRewards / totalStaked) * 100;
};

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format number with commas for thousands
export const formatNumber = (num) => {
  if (!num) return "0";
  return num.toLocaleString("en-US");
};

// Debugging function to verify staking pool status
export const debugStakingPool = async (
  connection,
  publicKey,
  getProgram,
  TOKEN_MINT,
  PROGRAM_ID
) => {
  if (!publicKey || !connection) {
    console.log("Wallet not connected - can't debug");
    return;
  }

  try {
    console.log("Starting staking pool debug...");

    // Get the program
    const program = getProgram();
    if (!program) {
      console.log("Program is null - check wallet connection");
      return;
    }

    // Find the expected PDA
    const stakingPoolAddress = await findStakingPoolAddress(
      PROGRAM_ID,
      TOKEN_MINT
    );
    console.log(
      "Expected staking pool address:",
      stakingPoolAddress.toString()
    );

    // Check if the account exists on-chain
    const accountInfo = await connection.getAccountInfo(stakingPoolAddress);
    console.log("Account exists on-chain:", !!accountInfo);

    if (!accountInfo) {
      console.log("Account doesn't exist - initialization may have failed");
      return null;
    }

    console.log("Account data size:", accountInfo.data.length);
    console.log("Account owner:", accountInfo.owner.toString());

    // Check if the owner is your program
    if (accountInfo.owner.toString() !== PROGRAM_ID.toString()) {
      console.log("Account is owned by a different program - PDA collision");
      return null;
    }

    // Try to fetch and decode the account data
    try {
      const poolData = await program.account.stakingPool.fetch(
        stakingPoolAddress
      );
      console.log("Successfully fetched pool data:", poolData);

      // Check if key fields exist
      console.log("Authority:", poolData.authority?.toString());
      console.log("Token mint:", poolData.tokenMint?.toString());
      console.log("Total staked:", poolData.totalStaked?.toString());

      // Compare to expected values
      if (poolData.tokenMint?.toString() !== TOKEN_MINT.toString()) {
        console.log("Token mint mismatch - check your constants");
      }

      return poolData;
    } catch (err) {
      console.error("Error decoding account data:", err);
      console.log(
        "This could indicate a program version mismatch or invalid account data"
      );
      return null;
    }
  } catch (error) {
    console.error("Debug error:", error);
    return null;
  }
};
