import { ethers, network, waffle } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
//import { deployContract } from "waffle";
require("@nomiclabs/hardhat-waffle");

describe("Minter", function () {
  let accounts: SignerWithAddress[];
  let nftFirst: Contract;
  let nftSecond: Contract;
  let nftThird: Contract;
  let minter: Contract;
  let owner: SignerWithAddress;
  let staker1: SignerWithAddress;
  let staker2: SignerWithAddress;

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    staker1 = accounts[1];
    staker2 = accounts[2];

    const minterFact = await ethers.getContractFactory("Minter");
    minter = await minterFact.deploy(owner.address);
    await minter.deployed();

    const nftFirstFact = await ethers.getContractFactory("NFTFirst");
    nftFirst = await nftFirstFact.deploy(minter.address);
    await nftFirst.deployed();

    const nftSecondFact = await ethers.getContractFactory("NFTSecond");
    nftSecond = await nftSecondFact.deploy(minter.address);
    await nftSecond.deployed();

    const nftThirdFact = await ethers.getContractFactory("NFTThird");
    nftThird = await nftThirdFact.deploy(minter.address);
    await nftThird.deployed();

    await minter.setNFTAddresses(
      nftFirst.address,
      nftSecond.address,
      nftThird.address
    );
  });

  const expectInitial = async () => {
    await expect(nftFirst.ownerOf(1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(nftSecond.ownerOf(1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(nftThird.ownerOf(1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  };

  it("Initial check", async function () {
    await expectInitial();
  });

  it("No access", async function () {
    await expect(
      minter
        .connect(staker1)
        .setNFTAddresses(nftFirst.address, nftSecond.address, nftThird.address)
    ).to.be.revertedWith("Only the contract owner may perform this action");

    await expect(
      minter.connect(staker1).whitelist(1, owner.address)
    ).to.be.revertedWith("Only the contract owner may perform this action");
  });

  it("No claiming without whitelist", async function () {
    await minter.claimNFTs();
    await expectInitial();

    const amIEligible = await minter.amIEligible();
    const amIEligible2 = await minter.connect(staker1).amIEligible();
    expect(amIEligible).to.equal(false);
    expect(amIEligible2).to.equal(false);
  });

  it("No resetting NFT addresses", async function () {
    await expect(
      minter.setNFTAddresses(
        nftFirst.address,
        nftSecond.address,
        nftThird.address
      )
    ).to.be.revertedWith("You can only set NFT addresses once");
  });

  it("Whitelisting", async function () {
    expect(await minter.tier1Whitelist(staker1.address)).to.equal(false);
    await minter.whitelist(1, staker1.address);
    expect(await minter.tier1Whitelist(staker1.address)).to.equal(true);

    expect(await minter.tier2Whitelist(staker1.address)).to.equal(false);
    await minter.whitelist(2, staker1.address);
    expect(await minter.tier2Whitelist(staker1.address)).to.equal(true);

    expect(await minter.tier3Whitelist(staker1.address)).to.equal(false);
    await minter.whitelist(3, staker1.address);
    expect(await minter.tier3Whitelist(staker1.address)).to.equal(true);
  });

  it("Eligibility", async function () {
    expect(await minter.connect(staker1.address).amIEligible()).to.equal(false);
    await minter.whitelist(1, staker1.address);
    expect(await minter.connect(staker1.address).amIEligible()).to.equal(true);

    await minter.whitelist(2, staker1.address);
    expect(await minter.connect(staker1.address).amIEligible()).to.equal(true);
  });

  it("Claiming", async function () {
    await minter.whitelist(1, staker1.address);
    await minter.connect(staker1).claimNFTs();
    expect(await nftFirst.ownerOf(1)).to.equal(staker1.address);

    await minter.whitelist(2, staker1.address);
    await minter.whitelist(3, staker1.address);
    await minter.connect(staker1).claimNFTs();
    expect(await nftSecond.ownerOf(1)).to.equal(staker1.address);
    expect(await nftThird.ownerOf(1)).to.equal(staker1.address);
  });

  it("No double claiming", async function () {
    await minter.whitelist(1, staker1.address);
    await minter.connect(staker1).claimNFTs();

    await minter.whitelist(1, staker1.address);
    await minter.connect(staker1).claimNFTs();

    await minter.whitelist(2, staker1.address);
    await minter.connect(staker1).claimNFTs();

    await minter.whitelist(3, staker1.address);
    await minter.connect(staker1).claimNFTs();

    await minter.whitelist(1, staker1.address);
    await minter.connect(staker1).claimNFTs();

    expect(await nftFirst.ownerOf(1)).to.equal(staker1.address);
    expect(await nftSecond.ownerOf(1)).to.equal(staker1.address);
    expect(await nftThird.ownerOf(1)).to.equal(staker1.address);

    await expect(nftFirst.ownerOf(2)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(nftSecond.ownerOf(2)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(nftThird.ownerOf(2)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });
});

const increaseTime = async (seconds: number) => {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
};
