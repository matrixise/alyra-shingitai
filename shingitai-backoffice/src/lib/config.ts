'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'wagmi/chains';

const projectId = 'PROJECT_SHINGITAI';

// const isHardhat = process.env.NEXT_PUBLIC_BLOCKCHAIN === "hardhat";

export const config = getDefaultConfig({
  appName: 'ShinGiTai',
  projectId,
  chains: [hardhat],
  ssr: true,
});
