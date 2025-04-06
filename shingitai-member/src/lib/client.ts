import { http } from 'viem';
import { hardhat } from 'wagmi/chains';

export function getConfigForClient() {
  // const isHardhat = process.env.NEXT_PUBLIC_BLOCKCHAIN === "hardhat";
  // const chain = isHardhat ? hardhat : sepolia;

  return {
    chain: hardhat,
    transport: http(),
  };
}

// export const publicClient = createPublicClient(getConfigForClient());
