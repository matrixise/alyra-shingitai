import { gradeSbtAbi } from '@/generated';

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const CONTRACT_ABI = gradeSbtAbi;

export const wagmiContract = {
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
} as const;
