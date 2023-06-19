require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '/.env') });
const { SEPOLIA_ALCHEMY_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: SEPOLIA_ALCHEMY_URL || "",
      accounts: [PRIVATE_KEY || ""]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
  },
};
