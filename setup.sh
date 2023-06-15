#!/bin/sh

# https://nodejs.org/en/download
sudo snap install node --classic

node_version="$(node --version)"

printf 'Node Version: %s\n' "$node_version"
mkdir solidity-project

cd solidity-project

mkdir smart-contract

# https://docs.soliditylang.org/en/v0.8.20/installing-solidity.html#installing-solidity
sudo npm install -g solc

cd smart-contract

# https://hardhat.org/hardhat-runner/docs/getting-started#installation
npm init
npm install --save-dev hardhat
# select typescript

# compile project.
#npx hardhat compile

# Test project
# npx hardhat test

# install metamask browser extension
# https://metamask.io/


# Test faucet
# https://sepoliafaucet.com/

