import {createConfig} from "ponder";
import {http} from "viem";
import {gradeSbtAbi, participationSftAbi} from "./abis/generated";


export default createConfig({
  networks: {
    hardhat: {
      chainId: 31337,
      transport: http("http://127.0.0.1:8545"),
    },
  },
  // FIXME: Utiliser les informations depuis le deployment
  contracts: {
    GradeSBT: {
      network: "hardhat",
      abi: gradeSbtAbi,
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    },
    ParticipationSFT: {
      network: "hardhat",
      abi: participationSftAbi,
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    },
  },
});
