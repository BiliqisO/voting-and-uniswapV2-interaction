import { ethers } from "hardhat";

async function main() {
  const voting = await ethers.deployContract("Voting");

  await voting.waitForDeployment();

  console.log(` deployed to ${voting.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
