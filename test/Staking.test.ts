import { ethers, network, waffle } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
//import { deployContract } from "waffle";
require("@nomiclabs/hardhat-waffle");

describe("Reward calculation", function () {
  /* let accounts: SignerWithAddress[];
  let staking: Contract;
  let stakeToken: Contract;
  let owner: SignerWithAddress;
  const hour = ethers.BigNumber.from("3600");
  const one = ethers.BigNumber.from("1");
  const ten = ethers.BigNumber.from("10");
  const thousand = ethers.BigNumber.from("1000");
  const tenThousand = ethers.BigNumber.from("10000");
  const hundredThousand = ethers.BigNumber.from("100000");
  const zero = ethers.BigNumber.from("0");

  const twentyTokens = ethers.utils.parseUnits("20", 18);
  const stakeTokenstotal = twentyTokens;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    const stakeTokenFact = await ethers.getContractFactory("ERC20Mock");
    stakeToken = await stakeTokenFact.deploy(owner.address, stakeTokenstotal);
    await stakeToken.deployed();

    const stakingFact = await ethers.getContractFactory("Staking");
    staking = await stakingFact.deploy(stakeToken.address);
    await staking.deployed();
  });

   it("One hour gives one reward", async function () {
    const reward = await staking.getRewardAmountForMoment(0, hour, 1000, 1000);
    expect(reward).to.equal(one);
  });

  it("Less than an hour gives no reward", async function () {
    console.log("hmmm", hour.sub(one).toString());
    const reward = await staking.getRewardAmountForMoment(
      0,
      hour.sub(one),
      1000,
      1000
    );
    expect(reward).to.equal(zero);

    // Try with bigger stake
    const reward2 = await staking.getRewardAmountForMoment(
      0,
      hour.sub(one),
      1000000,
      1000000
    );
    expect(reward2).to.equal(zero);
  });

  it("One hour gives reward relative to the total stakes", async function () {
    const reward = await staking.getRewardAmountForMoment(
      0,
      hour,
      10000,
      100000
    );
    expect(reward).to.equal(one);
  });  */
});

describe("NFT functionality", function () {
  /*  let accounts: SignerWithAddress[];
  let staking: Contract;
  let stakeToken: Contract;
  let nft1: Contract;
  let owner: SignerWithAddress;

  const twentyTokens = ethers.utils.parseUnits("20", 18);
  const stakeTokenstotal = twentyTokens;

  const baseUrl = "http://blah/";

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    const stakeTokenFact = await ethers.getContractFactory("ERC20Mock");
    stakeToken = await stakeTokenFact.deploy(owner.address, stakeTokenstotal);
    await stakeToken.deployed();

    const stakingFact = await ethers.getContractFactory("Staking");
    staking = await stakingFact.deploy(stakeToken.address);
    await staking.deployed();

    const nft1Fact = await ethers.getContractFactory("HODLerNFT");
    nft1 = await nft1Fact.deploy(staking.address);

    await nft1.deployed();

    await staking.setNFTAddresses(nft1.address, nft1.address, nft1.address);
  });

  it("Minting the first NFT uses the right URL", async function () {
    await staking.mint();
    const url1 = await nft1.tokenURI(1);
    expect(url1).to.equal(baseUrl + "a");
  });

  it("Minting multiple NFTs rotates the URLs", async function () {
    await staking.mint();
    await staking.mint();
    await staking.mint();
    const url1 = await nft1.tokenURI(1);
    const url2 = await nft1.tokenURI(2);
    const url3 = await nft1.tokenURI(3);
    expect(url1).to.equal(baseUrl + "a");
    expect(url2).to.equal(baseUrl + "b");
    expect(url3).to.equal(baseUrl + "a");
  }); */
});

describe("Staking", function () {
  let accounts: SignerWithAddress[];
  let staking: Contract;
  let stakeToken: Contract;
  let rewardToken: Contract;
  let owner: SignerWithAddress;
  let staker1: SignerWithAddress;
  let staker2: SignerWithAddress;
  let staker3: SignerWithAddress;
  let rewardDistributer: SignerWithAddress;
  const oneToken = ethers.utils.parseUnits("1", 18);
  const twoTokens = ethers.utils.parseUnits("2", 18);
  const twentyTokens = ethers.utils.parseUnits("20", 18);
  const thousandTokens = ethers.utils.parseUnits("1000", 18);
  const initialNativeBalance = twentyTokens;
  const stakeTokenstotal = twentyTokens;
  const rewardTokenstotal = twentyTokens;
  const zero = ethers.BigNumber.from("0") as BigNumber;
  const justAboveZero = ethers.BigNumber.from("1");
  const rewardsDuration = 60 * 60 * 24 * 7; // 7 days

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    staker1 = accounts[1];
    staker2 = accounts[2];
    staker3 = accounts[3];
    rewardDistributer = accounts[4];

    const stakeTokenFact = await ethers.getContractFactory("ERC20Mock");
    stakeToken = await stakeTokenFact.deploy(owner.address, thousandTokens);
    await stakeToken.deployed();

    stakeToken.transfer(staker1.address, twentyTokens);
    stakeToken.transfer(staker2.address, twentyTokens);
    stakeToken.transfer(staker3.address, twentyTokens);

    const rewardTokenFact = await ethers.getContractFactory("ERC20Mock");
    rewardToken = await rewardTokenFact.deploy(
      rewardDistributer.address,
      thousandTokens
    );
    await rewardToken.deployed();

    const stakingFact = await ethers.getContractFactory("StakingRewards");
    staking = await stakingFact.deploy(
      owner.address,
      rewardDistributer.address,
      rewardToken.address,
      stakeToken.address
    );
    await staking.deployed();

    /*    await owner.sendTransaction({
      to: staking.address,
      value: initialNativeBalance,
    }); */
  });

  it("initial data is correct", async function () {
    await expectInitial();
  });

  const expectInitial = async () => {
    const rewardTokenBalance = await rewardToken.balanceOf(owner.address);
    const stakeBalance = await staking.balanceOf(owner.address);
    const stakeReward = await staking.earned(owner.address);
    const updateTime = await staking.lastUpdateTime();
    const periodFinish = await staking.periodFinish();
    /*     const stakeNativeBalance = await ethers.provider.getBalance(staking.address); */

    expect(rewardTokenBalance).to.equal(zero);
    expect(stakeBalance).to.equal(zero);
    expect(stakeReward).to.equal(zero);
    expect(updateTime).to.equal(zero);
    expect(periodFinish).to.equal(zero);
    /* expect(stakeNativeBalance).to.equal(initialNativeBalance); */
  };

  it("Unstaking without stake reverts", async function () {
    await expect(staking.withdraw(zero)).to.be.revertedWith(
      "Cannot withdraw 0"
    );
  });

  it("Staking with zero reverts", async function () {
    await expect(staking.stake(zero)).to.be.revertedWith("Cannot stake 0");
  });

  it("Immediate unstake returns original state", async function () {
    await stakeToken.connect(staker1).approve(staking.address, oneToken);
    await staking.connect(staker1).stake(oneToken);
    await staking.connect(staker1).withdraw(oneToken);
    await expectInitial();
  });

  it("Immediate unstake after double stake returns original state", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await staking.connect(staker1).stake(oneToken);
    await staking.connect(staker1).stake(oneToken);
    await staking.connect(staker1).withdraw(twoTokens);
    await expectInitial();
  });

  it("Staking without rewards gives nothing", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await staking.connect(staker1).stake(oneToken);

    await increaseTime(rewardsDuration);

    await staking.connect(staker1).exit();
    await expectInitial();
  });

  it("Reward insertion updates variables", async function () {
    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);

    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    const update = await staking.lastUpdateTime();
    const periodFinish = await staking.periodFinish();

    const currBlock = await ethers.provider.getBlock(
      await ethers.provider.getBlockNumber()
    );
    expect(update).to.gt(zero);
    expect(periodFinish).to.equal(update.add(rewardsDuration));
    expect(update).to.equal(currBlock.timestamp);
  });

  it("Single staking gives all rewards", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await staking.connect(staker1).stake(oneToken);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    await increaseTime(rewardsDuration);

    await staking.connect(staker1).exit();
    const rewardBalance = await rewardToken.balanceOf(staker1.address);

    expect(rewardBalance).to.be.closeTo(twoTokens, 10e7);
  });

  it("Single user, multiple stakes gives all rewards", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await staking.connect(staker1).stake(oneToken);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    await increaseTime(rewardsDuration / 2);
    await staking.connect(staker1).stake(oneToken);
    await increaseTime(rewardsDuration / 2);

    await staking.connect(staker1).exit();
    const rewardBalance = await rewardToken.balanceOf(staker1.address);

    expect(rewardBalance).to.be.closeTo(twoTokens, 10e7);
  });

  it("Two equal stakers, gives equal rewards", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await stakeToken.connect(staker2).approve(staking.address, twoTokens);

    await setAutoMine(false);
    await staking.connect(staker1).stake(oneToken);
    await staking.connect(staker2).stake(oneToken);
    await setAutoMine(true);
    await network.provider.send("evm_mine");

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    await increaseTime(rewardsDuration / 2);

    await setAutoMine(false);
    await staking.connect(staker1).exit();
    await staking.connect(staker2).exit();
    await setAutoMine(true);

    const rewardBalance1 = await rewardToken.balanceOf(staker1.address);
    const rewardBalance2 = await rewardToken.balanceOf(staker2.address);

    expect(rewardBalance1).to.eq(rewardBalance2);
    expect(rewardBalance1).to.be.gt(0);
  });

  it("Two inequal stakers, gives inequal rewards", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await stakeToken.connect(staker2).approve(staking.address, oneToken);

    await setAutoMine(false);
    await staking.connect(staker1).stake(twoTokens);
    await staking.connect(staker2).stake(oneToken);
    await setAutoMine(true);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    await increaseTime(rewardsDuration / 4);

    // Increase rewards
    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, oneToken);
    await staking.connect(rewardDistributer).notifyRewardAmount(oneToken);
    await increaseTime(rewardsDuration / 2);

    await setAutoMine(false);
    await staking.connect(staker1).exit();
    await staking.connect(staker2).exit();
    await setAutoMine(true);

    const rewardBalance1 = await rewardToken.balanceOf(staker1.address);
    const rewardBalance2 = await rewardToken.balanceOf(staker2.address);

    expect(rewardBalance1).to.eq(rewardBalance2.mul(2));
    expect(rewardBalance1).to.be.gt(0);
  });

  it("Two inequal stakers, one enters halfway, gives inequal rewards", async function () {
    await stakeToken.connect(staker1).approve(staking.address, oneToken);
    await stakeToken.connect(staker2).approve(staking.address, oneToken);

    await staking.connect(staker1).stake(oneToken);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);
    await setAutoMine(true);
    await increaseTime(rewardsDuration / 2);

    await staking.connect(staker2).stake(oneToken);

    await increaseTime(rewardsDuration / 2);

    await setAutoMine(false);
    await staking.connect(staker1).exit();
    await staking.connect(staker2).exit();
    await setAutoMine(true);

    const rewardBalance1 = await rewardToken.balanceOf(staker1.address);
    const rewardBalance2 = await rewardToken.balanceOf(staker2.address);

    //console.log("bal", rewardBalance1.toString(), rewardBalance2.toString());
    expect(rewardBalance1).to.be.closeTo(rewardBalance2.mul(3), 10e13);
    expect(rewardBalance1).to.be.gt(0);
  });

  it("Two stakers for multiple reward periods", async function () {
    await stakeToken.connect(staker1).approve(staking.address, twoTokens);
    await stakeToken.connect(staker2).approve(staking.address, twoTokens);

    await setAutoMine(false);
    await staking.connect(staker1).stake(oneToken);
    await staking.connect(staker2).stake(oneToken);
    await setAutoMine(true);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    // Make the first reward period end for sure
    await increaseTime(rewardsDuration + 100);

    const rewardBalance1First = await staking.earned(staker1.address);
    const rewardBalance2First = await staking.earned(staker2.address);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, oneToken);
    await staking.connect(rewardDistributer).notifyRewardAmount(oneToken);

    // Proceed with second reward period for some time
    await increaseTime(rewardsDuration / 2);

    await setAutoMine(false);
    await staking.connect(staker1).exit();
    await staking.connect(staker2).exit();
    await setAutoMine(true);

    const rewardBalance1Second = await rewardToken.balanceOf(staker1.address);
    const rewardBalance2Second = await rewardToken.balanceOf(staker2.address);

    expect(rewardBalance1First).to.eq(rewardBalance2First);
    expect(rewardBalance1First).to.be.gt(0);
    expect(rewardBalance1Second).to.eq(rewardBalance2Second);
    expect(rewardBalance1Second).to.be.gt(0);
  });

  const increaseTime = async (seconds: number) => {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  };

  const setAutoMine = async (on: boolean) => {
    await network.provider.send("evm_setAutomine", [on]);
    if (on) {
      await network.provider.send("evm_mine");
    }
  };

  /*   const atomicTrans = async (trans: (() => void)[]) => {
    await network.provider.send("evm_setAutomine", [false]);
    trans.forEach(async (t) => {
      await t();
    });
    await network.provider.send("evm_setAutomine", [true]);
  }; */
  /* 
  it("Single user, multiple stakes gives all rewards", async function () {
    await stakeToken.approve(staking.address, twoTokens);
    await staking.stake(oneToken);

    await rewardToken
      .connect(rewardDistributer)
      .transfer(staking.address, twoTokens);
    await staking.connect(rewardDistributer).notifyRewardAmount(twoTokens);

    await increaseTime(rewardsDuration);

    await staking.exit();
    const rewardBalance = await rewardToken.balanceOf(owner.address);

    expect(rewardBalance).to.be.closeTo(twoTokens, 10e7);
  }); */

  /* 
  // Two participants in the same farm, with the same stake
  it("Staking gives rewards to two participants", async function () {
    await farmController.notifyRewards(rewardTokenstotal);

    //console.log('farm balance',  (await rewardToken.balanceOf(farm.address)).toString());
    const initialBalance = await rewardToken.balanceOf(notOwner.address);
    const initialStakeBalance = await stakeToken.balanceOf(notOwner.address);

    await stakeToken.connect(notOwner).approve(farm.address, oneToken);
    await farm.connect(notOwner).stake(oneToken);

    await stakeToken.connect(notOwner2).approve(farm.address, oneToken);
    await farm.connect(notOwner2).stake(oneToken);

    // Increase time by almost 1 week
    await network.provider.send("evm_increaseTime", [3550 * 24 * 7]);
    await network.provider.send("evm_mine");

    await farm.connect(notOwner).getReward();
    await farm.connect(notOwner).withdraw(oneToken);

    await farm.connect(notOwner2).getReward();
    await farm.connect(notOwner2).withdraw(oneToken);

    //console.log('farm balance',  (await rewardToken.balanceOf(farm.address)).toString());

    const afterBalance = await rewardToken.balanceOf(notOwner.address);
    const afterOtherBalance = await rewardToken.balanceOf(notOwner2.address);
    const afterStakeBalance = await stakeToken.balanceOf(notOwner.address);

    //console.log('before', initialBalance.toString());
    //console.log('after ', afterBalance.toString(), afterOtherBalance.toString());

    expect(afterBalance).to.be.above(initialBalance);
    expect(initialStakeBalance).to.equal(afterStakeBalance);

    const precision = 1e13; // remove some precision from numbers
    // make sure both participants get the same amount
    expect(afterOtherBalance.div(precision)).to.equal(
      afterBalance.div(precision)
    );
  }); */

  /*

  // Two participants, each in his own farm. Farms are set to have equal reward rates.
  it("Two farms give equal rewards", async function () {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const stakeToken2 = await MockERC20.deploy("blah", "bleh");
    await stakeToken2.deployed();
    await stakeToken2.getFreeTokens(notOwner2.address, tenTokens);

    await farmController.addFarm(stakeToken2.address, { gasLimit: 2000000});
    await farmController.setRates([1, 1]);

    const farm2Addr = await farmController.getFarm(1);
    const FarmFactory = await ethers.getContractFactory("LPFarm");
    const farm2 = FarmFactory.attach(farm2Addr);

    await rewardToken.approve(farmController.address, rewardTokenstotal);
    await farmController.notifyRewards(rewardTokenstotal);


    //console.log('farm balance',  (await rewardToken.balanceOf(farm.address)).toString());
    const initialBalance = await rewardToken.balanceOf(notOwner.address);
    const initialBalance2 = await rewardToken.balanceOf(notOwner2.address);

    await stakeToken.connect(notOwner).approve(farm.address, oneToken);
    await farm.connect(notOwner).stake(oneToken);

    await stakeToken2.connect(notOwner2).approve(farm2.address, oneToken);
    await farm2.connect(notOwner2).stake(oneToken);

    // Increase time by almost 1 week
    await network.provider.send("evm_increaseTime", [3550 * 24 * 7]);
    await network.provider.send("evm_mine");

    await farm.connect(notOwner).getReward();
    await farm.connect(notOwner).withdraw(oneToken); 

    await farm2.connect(notOwner2).getReward();
    await farm2.connect(notOwner2).withdraw(oneToken); 

    //console.log('farm balance',  (await rewardToken.balanceOf(farm.address)).toString());
    
    const afterBalance = await rewardToken.balanceOf(notOwner.address);
    const afterOtherBalance = await rewardToken.balanceOf(notOwner2.address);

    //console.log('before', initialBalance.toString());
    console.log('after ', afterBalance.toString(), afterOtherBalance.toString());

    expect(afterBalance).to.be.above(initialBalance);
    expect(afterOtherBalance).to.be.above(initialBalance2);

    // make sure both participants get the same amount
    expect(afterOtherBalance).to.equal(afterBalance);
  });  */
});
