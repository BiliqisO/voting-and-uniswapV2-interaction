import { ethers, network } from "hardhat";

async function main() {
  //contract addresses from etherscan
  const uniswapAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const WETH = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
  //EOA that has enough uni token we can impersonate
  const UNITokenholder = "0x20bB82F2Db6FF52b42c60cE79cDE4C7094Ce133F";
  const AmountAdesired = await ethers.parseEther("20");
  const AmountBdesired = await ethers.parseEther("20");
  const AmountAMin = await ethers.parseEther("0");
  const AmountBMin = await ethers.parseEther("0");
  const to = "0xa5FFf172361008408da8AcFaF4a9f32012314cA9";
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const deadline = currentTimestampInSeconds + 90400;

  //impersonating the uni token holder
  const impersonatedSigner = await ethers.getImpersonatedSigner(UNITokenholder);

  //creating an instance of the contractv in the script
  const uniswap = await ethers.getContractAt("IUniswap", uniswapAddr);
  const wethcontract = await ethers.getContractAt("IERC20", WETH);
  const daicontract = await ethers.getContractAt("IERC20", DAI);
  //     const path = [unicontract, daicontract]

  const factory = await uniswap.factory();
  const uniswapFactory = await ethers.getContractAt(
    "IUniswapV2Factory",
    factory
  );

  const pairAddress = await uniswapFactory.getPair(WETH, DAI);
  // console.log({ pairAddress });

  const pairContract = await ethers.getContractAt("IERC20", pairAddress);

  //approve the uniswap contract
  await wethcontract
    .connect(impersonatedSigner)
    .approve(uniswapAddr, ethers.parseEther("300000"));
  await daicontract
    .connect(impersonatedSigner)
    .approve(uniswapAddr, ethers.parseEther("100000"));
  await pairContract
    .connect(impersonatedSigner)
    .approve(uniswapAddr, ethers.parseEther("10000"));

  const uniTokenbalanceBefore = await wethcontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);
  const daiTokenbalanceBefore = await daicontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);

  console.log(
    `uniTokenbalanceBefore: ${ethers.formatEther(uniTokenbalanceBefore)}`
  );
  console.log(
    `DaiTokenbalanceBefore: ${ethers.formatEther(daiTokenbalanceBefore)}`
  );

  await uniswap
    .connect(impersonatedSigner)
    .addLiquidity(
      WETH,
      DAI,
      AmountAdesired,
      AmountBdesired,
      AmountAMin,
      AmountBMin,
      impersonatedSigner,
      deadline
    );
  const uniTokenbalanceAfter = await wethcontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);
  const daiTokenbalanceAfter = await daicontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);
  const LiquidityBalanceBefore = await pairContract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);

  console.log(
    `uniTokenbalanceAfter: ${ethers.formatEther(uniTokenbalanceAfter)}`
  );
  console.log(
    `DaiTokenbalanceAfter: ${ethers.formatEther(daiTokenbalanceAfter)}`
  );
  console.log(`LiquidityBalanceBefore: ${LiquidityBalanceBefore}`);
  await uniswap
    .connect(impersonatedSigner)
    .removeLiquidity(
      WETH,
      DAI,
      LiquidityBalanceBefore,
      AmountAMin,
      AmountBMin,
      impersonatedSigner,
      deadline
    );
  const uniAfterRemoveLiquiduity = await wethcontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);
  const daiAfterRemovingLiquidity = await daicontract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);

  const LiquidityBalanceAfter = await pairContract
    .connect(impersonatedSigner)
    .balanceOf(impersonatedSigner);

  console.log(`LiquidityBalanceAfter: ${LiquidityBalanceAfter}`);
  console.log(`uniAfterRemoveLiquiduity: ${uniAfterRemoveLiquiduity}`);
  console.log(`daiAfterRemovingLiquidity: ${daiAfterRemovingLiquidity}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
