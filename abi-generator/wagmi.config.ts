// @ts-check

import {hardhat, react} from "@wagmi/cli/plugins";

/** @type {import('@wagmi/cli').Config} */
export default {
  out: 'src/generated.ts',
  contracts: [],
  plugins: [
    hardhat({
      project: '../shingitai-backend',
    }),
  ],
}
