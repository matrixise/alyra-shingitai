import type {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomiclabs/hardhat-solhint";
import {NetworksUserConfig} from "hardhat/types";
require("dotenv").config()

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const networks: NetworksUserConfig | undefined = {};

networks.hardhat = {
    loggingEnabled: false,
}

if (process.env.SEPOLIA_RPC_URL && process.env.PRIVATE_KEY) {
    networks.sepolia = {
        url: process.env.SEPOLIA_RPC_URL,
        chainId: 11155111,
        accounts: [process.env.PRIVATE_KEY]
    }
}

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    defaultNetwork: "hardhat",
    networks: networks,
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_API_KEY
        },
    },
    gasReporter: {
	enabled: (process.env.REPORT_GAS) ? true : false
    }
};

export default config;
