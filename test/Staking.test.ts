import { ethers, network, waffle } from "hardhat";
import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
//import { deployContract } from "waffle";
//require("@nomiclabs/hardhat-waffle");

describe("Reward calculation", function () {
  let accounts: SignerWithAddress[];
  let staking : Contract;
  let stakeToken : Contract;
  let owner : SignerWithAddress;
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
    stakeToken = await stakeTokenFact.deploy(
      owner.address,
      stakeTokenstotal
    );
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
    console.log('hmmm', hour.sub(one).toString());
    const reward = await staking.getRewardAmountForMoment(0, hour.sub(one), 1000, 1000);
    expect(reward).to.equal(zero);

    // Try with bigger stake
    const reward2 = await staking.getRewardAmountForMoment(0, hour.sub(one), 1000000, 1000000);
    expect(reward2).to.equal(zero);
  });

  it("One hour gives reward relative to the total stakes", async function () {
    const reward = await staking.getRewardAmountForMoment(0, hour, 10000, 100000);
    expect(reward).to.equal(one);
  });

});

describe("Staking", function () {
  let accounts: SignerWithAddress[];
  let staking : Contract;
  let stakeToken : Contract;
  let owner : SignerWithAddress;
  let notOwner : SignerWithAddress;
  let notOwner2 : SignerWithAddress;
  const oneToken = ethers.utils.parseUnits("1", 18);
  const twoTokens = ethers.utils.parseUnits("2", 18);
  const twentyTokens = ethers.utils.parseUnits("20", 18);
  const initialNativeBalance = twentyTokens;
  const stakeTokenstotal = twentyTokens;
  const zero = ethers.BigNumber.from("0");
  const justAboveZero = ethers.BigNumber.from("1");
  const targetStakeTime = 3600 * 24 * 365; // 1 year


   beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    notOwner = accounts[1];
    notOwner2 = accounts[2];

    const stakeTokenFact = await ethers.getContractFactory("ERC20Mock");
    stakeToken = await stakeTokenFact.deploy(
      owner.address,
      stakeTokenstotal
    );
    await stakeToken.deployed();

    const stakingFact = await ethers.getContractFactory("Staking");
    staking = await stakingFact.deploy(stakeToken.address);
    await staking.deployed();
    await owner.sendTransaction({
      to: staking.address,
      value: initialNativeBalance
    });


/*     await stakeToken.getFreeTokens(owner.address, tenTokens);
    await stakeToken.getFreeTokens(notOwner.address, tenTokens);
    await stakeToken.getFreeTokens(notOwner2.address, tenTokens);

    const contrFactory = await ethers.getContractFactory("FarmController");
    farmController = await contrFactory.deploy(rewardToken.address);
    await farmController.deployed();
    
    await farmController.addFarm(stakeToken.address, { gasLimit: 2000000});

    const farmAddr = await farmController.getFarm(0);
    const FarmFactory = await ethers.getContractFactory("LPFarm");
    farm = FarmFactory.attach(farmAddr);

    await farmController.setRates([1]);
    

    await rewardToken.approve(farmController.address, rewardTokenstotal); */
    
    
    
  });

  /*  it("initial data is correct", async function () {
    await expectInitial();
  });

   it("Unstaking without stake reverts", async function () {
    await expect(staking.unstake()).to.be.revertedWith('Cannot unstake 0');
  });

  it("Staking with zero reverts", async function () {
    await expect(staking.stake(zero)).to.be.revertedWith('Cannot stake 0');
  });  

  const expectInitial = async () => {
    const bal = await stakeToken.balanceOf(owner.address);
    const stakeBalance = await staking.getStakeAmount(owner.address);
    const stakeReward = await staking.getRewardAmount(owner.address);
    const stakeNativeBalance = await ethers.provider.getBalance(staking.address);
    
    expect(bal).to.equal(stakeTokenstotal);
    expect(stakeBalance).to.equal(zero);
    expect(stakeReward).to.equal(zero);
    expect(stakeNativeBalance).to.equal(initialNativeBalance);
  }

  const increaseTime = async (seconds : number) => {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  }

  it("Immediate unstake returns original state", async function () {
    await stakeToken.approve(staking.address, oneToken);
    await staking.stake(oneToken);
    await staking.unstake();
    await expectInitial();
  });

  it("Immediate unstake after double stake returns original state", async function () {
    await stakeToken.approve(staking.address, twoTokens);
    await staking.stake(oneToken);
    await staking.stake(oneToken);
    await staking.unstake();
    await expectInitial();
  }); */

  /* it("Staking for the target time doubles the stake", async function () {
    await stakeToken.approve(staking.address, twoTokens);
    await staking.stake(oneToken);

    await increaseTime(targetStakeTime); // one year

    await staking.unstake();
    await expectInitial();
  }); */
/*
 
  it("Withdrawing results in the same balance", async function () {
    const initialBalance = await stakeToken.balanceOf(owner.address);
    await stakeToken.approve(farm.address, oneToken);
    await farm.stake(oneToken);
    const middleBalance = await stakeToken.balanceOf(owner.address);
    await farm.withdraw(oneToken);
    const afterBalance = await stakeToken.balanceOf(owner.address);
    
    expect(initialBalance).to.equal(afterBalance);
    expect(middleBalance).to.equal(afterBalance.sub(oneToken));
  });

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
    expect(afterOtherBalance.div(precision)).to.equal(afterBalance.div(precision));
  });

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
  }); */
});