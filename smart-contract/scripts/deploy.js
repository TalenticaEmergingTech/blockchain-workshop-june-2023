// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
  const simepleLotteryFactory = await ethers.getContractFactory("SimpleLottery");
  const contract = await simepleLotteryFactory.deploy([]);
  console.log(
    `Simple Lottery deployed to ${contract.target}`
  );

  await contract.deploymentTransaction().wait(6);

  /* console.log(`Verifying contract on etherscan`);
  await verify(contract.target, []); */
  console.log('Deployment complete');
}

const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
      await run("verify:verify", {
          address: contractAddress,
          constructorArguments: args,
      });
  } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
          console.log("Already verified!");
      } else {
          console.log(e);
      }
  }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
