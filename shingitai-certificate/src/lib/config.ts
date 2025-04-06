'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat } from 'wagmi/chains';

const projectId = 'PROJECT_SHINGITAI';

export const config = getDefaultConfig({
  appName: 'ShinGiTai',
  projectId,
  chains: [hardhat],
  ssr: true,
});
