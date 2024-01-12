# Smart Contracts for the lottery dApp.

This modules contains 2 smart contracts.

**1. Simple Lottery:**
There can be only 1 lottery active at a time. Owner of this lottery should be able to start a lottery if there is no running lottery. To start a lottery, owner has to provide the price of the ticket, max allowed participants, winner prize. Owner has to declare the winner once the requied number of participants has participated in the lottery.

**2. MegaLottery:**
The mega lottery will require minimum 5 participants and the number of winners will be 3.
There can be multiple lotteries active at a time. User can participate in any of the acive lottery. The total collected ticket amount will be distributed amongst the contract and winners as follows:

    1. 1st Winner - 50%
    2. 2nd Winner - 30%
    3. 3rd Winner - 10%
    4. Smart contract - 10%

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat compile
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

# Deployment Steps

```
npm install
npx hardhat compile
```

Add env vars in .env file

```
PRIVATE_KEY=
SCAN_API_KEY=
POLYGON_MUMBAI_ALCHEMY_URL=
```

Deploy Contract

```
npx hardhat run ./scripts/deploy.js --network polygon_mumbai
```

Update deployed contract address in scripts/verify.js

```
npx hardhat run ./scripts/verify.js --network polygon_mumbai
```
