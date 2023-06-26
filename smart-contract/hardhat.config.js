require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
const path = require('path');
require('dotenv').config();
const { SEPOLIA_ALCHEMY_URL, PRIVATE_KEY, SCAN_API_KEY, POLYGON_MUMBAI_ALCHEMY_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: SEPOLIA_ALCHEMY_URL || "https://eth-sepolia.g.alchemy.com/v2/",
      accounts: [PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000"]
    },
    polygon_mumbai: {
      url: POLYGON_MUMBAI_ALCHEMY_URL || "https://polygon-mumbai.g.alchemy.com/v2",
      accounts: [PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000"]  
    }
  },
  etherscan: {
    apiKey: SCAN_API_KEY || "0000000000000000000000000000000000",
  },
};
