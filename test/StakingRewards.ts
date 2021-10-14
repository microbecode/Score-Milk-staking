/* const { contract } = require('hardhat'); */
/* const { toBN } = require('web3-utils'); */

/* const { toBytes32 } = require('../..'); */
/* const { onlyGivenAddressCanInvoke, ensureOnlyExpectedMutativeFunctions } = require('./helpers'); */
/* const { assert, addSnapshotBeforeRestoreAfterEach } = require('./common');
const { mockToken, setupAllContracts, setupContract } = require('./setup');
const { currentTime, toUnit, fastForward } = require('../utils')(); */

import { ethers, network, waffle } from "hardhat";
import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

describe('StakingRewards', function() {
	let accounts: SignerWithAddress[];
	let staking: Contract;
	let stakeToken: Contract;
	let owner: SignerWithAddress;
	let mockRewardsDistributionAddress: string;
	const hour = ethers.BigNumber.from("3600");
	const one = ethers.BigNumber.from("1");
	const ten = ethers.BigNumber.from("10");
	const thousand = ethers.BigNumber.from("1000");
	const tenThousand = ethers.BigNumber.from("10000");
	const hundredThousand = ethers.BigNumber.from("100000");
	const zero = ethers.BigNumber.from("0");
	const twentyTokens = ethers.utils.parseUnits("20", 18);
	const stakeTokenstotal = twentyTokens;

	/* const [
		,
		owner,
		oracle,
		authority,
		rewardEscrowAddress,
		stakingAccount1,
		mockRewardsDistributionAddress,
	] = accounts;

	// Synthetix is the rewardsToken
	let rewardsToken,
		stakingToken,
		externalRewardsToken,
		exchangeRates,
		stakingRewards,
		rewardsDistribution,
		systemSettings,
		feePool;

	const DAY = 86400;
	const ZERO_BN = toBN(0); */

/* 	const setRewardsTokenExchangeRate = async ({ rateStaleDays } = { rateStaleDays: 7 }) => {
		const rewardsTokenIdentifier = await rewardsToken.symbol();

		await systemSettings.setRateStalePeriod(DAY * rateStaleDays, { from: owner });
		const updatedTime = await currentTime();
		await exchangeRates.updateRates(
			[toBytes32(rewardsTokenIdentifier)],
			[toUnit('2')],
			updatedTime,
			{
				from: oracle,
			}
		);
		assert.equal(await exchangeRates.rateIsStale(toBytes32(rewardsTokenIdentifier)), false);
	}; */

/* 	addSnapshotBeforeRestoreAfterEach(); */

	before(async () => {
		accounts = await ethers.getSigners();
		owner = accounts[0];
		mockRewardsDistributionAddress = accounts[1].address;
	
		const stakeTokenFact = await ethers.getContractFactory("ERC20Mock");
		stakeToken = await stakeTokenFact.deploy(owner.address, stakeTokenstotal);
		await stakeToken.deployed();
	
		const stakingFact = await ethers.getContractFactory("StakingRewards");
		staking = await stakingFact.deploy(owner.address, owner.address, stakeToken.address, stakeToken.address);
		await staking.deployed();


/* 		({ token: stakingToken } = await mockToken({
			accounts,
			name: 'Staking Token',
			symbol: 'STKN',
		})); */
/* 
		({ token: externalRewardsToken } = await mockToken({
			accounts,
			name: 'External Rewards Token',
			symbol: 'MOAR',
		})); */

/* 		({
			RewardsDistribution: rewardsDistribution,
			FeePool: feePool,
			Synthetix: rewardsToken,
			ExchangeRates: exchangeRates,
			SystemSettings: systemSettings,
		} = await setupAllContracts({
			accounts,
			contracts: ['RewardsDistribution', 'Synthetix', 'FeePool', 'SystemSettings'],
		})); */

/* 		stakingRewards = await setupContract({
			accounts,
			contract: 'StakingRewards',
			args: [owner, rewardsDistribution.address, rewardsToken.address, stakingToken.address],
		}); */

/* 		await Promise.all([
			rewardsDistribution.setAuthority(authority, { from: owner }),
			rewardsDistribution.setRewardEscrow(rewardEscrowAddress, { from: owner }),
			rewardsDistribution.setSynthetixProxy(rewardsToken.address, { from: owner }),
			rewardsDistribution.setFeePoolProxy(feePool.address, { from: owner }),
		]); */

		await staking.setRewardsDistribution(mockRewardsDistributionAddress, {
			from: owner.address,
		});
/* 		await setRewardsTokenExchangeRate(); */
	});

	


/* 	describe('External Rewards Recovery', () => {
		const amount = toUnit('5000');
		beforeEach(async () => {
			// Send ERC20 to StakingRewards Contract
			await externalRewardsToken.transfer(stakingRewards.address, amount, { from: owner });
			assert.bnEqual(await externalRewardsToken.balanceOf(stakingRewards.address), amount);
		});
		it('only owner can call recoverERC20', async () => {
			await onlyGivenAddressCanInvoke({
				fnc: stakingRewards.recoverERC20,
				args: [externalRewardsToken.address, amount],
				address: owner,
				accounts,
				reason: 'Only the contract owner may perform this action',
			});
		});
		it('should revert if recovering staking token', async () => {
			await assert.revert(
				stakingRewards.recoverERC20(stakingToken.address, amount, {
					from: owner,
				}),
				'Cannot withdraw the staking token'
			);
		});
		it('should retrieve external token from StakingRewards and reduce contracts balance', async () => {
			await stakingRewards.recoverERC20(externalRewardsToken.address, amount, {
				from: owner,
			});
			assert.bnEqual(await externalRewardsToken.balanceOf(stakingRewards.address), ZERO_BN);
		});
		it('should retrieve external token from StakingRewards and increase owners balance', async () => {
			const ownerMOARBalanceBefore = await externalRewardsToken.balanceOf(owner);

			await stakingRewards.recoverERC20(externalRewardsToken.address, amount, {
				from: owner,
			});

			const ownerMOARBalanceAfter = await externalRewardsToken.balanceOf(owner);
			assert.bnEqual(ownerMOARBalanceAfter.sub(ownerMOARBalanceBefore), amount);
		});
		it('should emit Recovered event', async () => {
			const transaction = await stakingRewards.recoverERC20(externalRewardsToken.address, amount, {
				from: owner,
			});
			assert.eventEqual(transaction, 'Recovered', {
				token: externalRewardsToken.address,
				amount: amount,
			});
		});
	});

	describe('lastTimeRewardApplicable()', () => {
		it('should return 0', async () => {
			assert.bnEqual(await stakingRewards.lastTimeRewardApplicable(), ZERO_BN);
		});

		describe('when updated', () => {
			it('should equal current timestamp', async () => {
				await stakingRewards.notifyRewardAmount(toUnit(1.0), {
					from: mockRewardsDistributionAddress,
				});

				const cur = await currentTime();
				const lastTimeReward = await stakingRewards.lastTimeRewardApplicable();

				assert.equal(cur.toString(), lastTimeReward.toString());
			});
		});
	}); */

/* 	describe('rewardPerToken()', () => {
		it('should return 0', async () => {
			assert.bnEqual(await stakingRewards.rewardPerToken(), ZERO_BN);
		});

		it('should be > 0', async () => {
			const totalToStake = toUnit('100');
			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			const totalSupply = await stakingRewards.totalSupply();
			assert.bnGt(totalSupply, ZERO_BN);
			l('supply', totalSupply);

			const rewardValue = toUnit(5000.0);
			await rewardsToken.transfer(stakingRewards.address, rewardValue, { from: owner });
			await stakingRewards.notifyRewardAmount(rewardValue, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 7);

			const rewardPerToken = await stakingRewards.rewardPerToken();
			l('per', rewardPerToken);
			assert.bnGt(rewardPerToken, ZERO_BN);
		});
	}); */


/* 
	describe('stake()', () => {
		it('staking increases staking balance', async () => {
			const totalToStake = toUnit('100');
			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });

			const initialStakeBal = await stakingRewards.balanceOf(stakingAccount1);
			const initialLpBal = await stakingToken.balanceOf(stakingAccount1);

			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			const postStakeBal = await stakingRewards.balanceOf(stakingAccount1);
			const postLpBal = await stakingToken.balanceOf(stakingAccount1);

			assert.bnLt(postLpBal, initialLpBal);
			assert.bnGt(postStakeBal, initialStakeBal);
		});

		it('cannot stake 0', async () => {
			await assert.revert(stakingRewards.stake('0'), 'Cannot stake 0');
		});
	});
*/
const l = (msg : string, str : any) => {
	
	let text = [];
	const tos = str.toString();
	text.push(msg);
	text.push(str.toString());
	if (tos.length > 18) {
		text.push(str.toString().substring(0, str.toString().length - 18));
	}
	if (tos.length > 15) {
		text.push(str.toString().substring(0, str.toString().length - 15));
	}
	if (tos.length > 12) {
		text.push(str.toString().substring(0, str.toString().length - 12));
	}
	
	console.log(...text);
}
	describe('earned()', () => {
/* 		it('should be 0 when not staking', async () => {
			assert.bnEqual(await stakingRewards.earned(stakingAccount1), ZERO_BN);
		}); */

/* 		it('should be > 0 when staking', async () => {
			const totalToStake = toUnit('100');
			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			const rewardValue = toUnit(5000.0);
			await rewardsToken.transfer(stakingRewards.address, rewardValue, { from: owner });
			await stakingRewards.notifyRewardAmount(rewardValue, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY);

			const earned = await stakingRewards.earned(stakingAccount1);

			assert.bnGt(earned, ZERO_BN);
		}); */

		/* it('rewardRate should increase if new rewards come before DURATION ends', async () => {
			const totalToDistribute = toUnit('5000');

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			const rewardRateInitial = await stakingRewards.rewardRate();

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			const rewardRateLater = await stakingRewards.rewardRate();

			assert.bnGt(rewardRateInitial, ZERO_BN);
			assert.bnGt(rewardRateLater, rewardRateInitial);

			l("initial", rewardRateInitial);
			l("after", rewardRateLater);
		}); */

		 it('rewards token balance should rollover after DURATION', async () => {
		/* 	const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 6);
			const earnedFirst = await stakingRewards.earned(stakingAccount1);

			//await setRewardsTokenExchangeRate();
			 


			await fastForward(DAY * 3);
			const earnedSecond = await stakingRewards.earned(stakingAccount1);

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			}); 

			
			const earnedThird = await stakingRewards.earned(stakingAccount1);

			
			await fastForward(DAY * 3);
		
			const earnedFourth = await stakingRewards.earned(stakingAccount1);

			await fastForward(DAY * 3);
			const earnedFifth = await stakingRewards.earned(stakingAccount1);

l("rew", totalToDistribute)
			l("1", earnedFirst);
			l("2", earnedSecond);
			l("3", earnedThird);
			l("4", earnedFourth);
			l("5", earnedFifth);
			*/
		});  

	/* 	it('rewards token balance should rollover after DURATION', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 7);
			const earnedFirst = await stakingRewards.earned(stakingAccount1);

			//await setRewardsTokenExchangeRate();
			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 7);
			const earnedSecond = await stakingRewards.earned(stakingAccount1);

			//assert.bnEqual(earnedSecond, earnedFirst.add(earnedFirst));

			l("initial", earnedFirst);
			l("after", earnedSecond);
		});  */
	});

	/*
	describe('getReward()', () => {
		it('should increase rewards token balance', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY);

			const initialRewardBal = await rewardsToken.balanceOf(stakingAccount1);
			const initialEarnedBal = await stakingRewards.earned(stakingAccount1);
			await stakingRewards.getReward({ from: stakingAccount1 });
			const postRewardBal = await rewardsToken.balanceOf(stakingAccount1);
			const postEarnedBal = await stakingRewards.earned(stakingAccount1);

			assert.bnLt(postEarnedBal, initialEarnedBal);
			assert.bnGt(postRewardBal, initialRewardBal);
		});
	});

	describe('setRewardsDuration()', () => {
		const sevenDays = DAY * 7;
		const seventyDays = DAY * 70;
		it('should increase rewards duration before starting distribution', async () => {
			const defaultDuration = await stakingRewards.rewardsDuration();
			assert.bnEqual(defaultDuration, sevenDays);

			await stakingRewards.setRewardsDuration(seventyDays, { from: owner });
			const newDuration = await stakingRewards.rewardsDuration();
			assert.bnEqual(newDuration, seventyDays);
		});
		it('should revert when setting setRewardsDuration before the period has finished', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY);

			await assert.revert(
				stakingRewards.setRewardsDuration(seventyDays, { from: owner }),
				'Previous rewards period must be complete before changing the duration for the new period'
			);
		});
		it('should update when setting setRewardsDuration after the period has finished', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 8);

			const transaction = await stakingRewards.setRewardsDuration(seventyDays, { from: owner });
			assert.eventEqual(transaction, 'RewardsDurationUpdated', {
				newDuration: seventyDays,
			});

			const newDuration = await stakingRewards.rewardsDuration();
			assert.bnEqual(newDuration, seventyDays);

			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});
		});

		it('should update when setting setRewardsDuration after the period has finished', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 4);
			await stakingRewards.getReward({ from: stakingAccount1 });
			await fastForward(DAY * 4);

			// New Rewards period much lower
			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			const transaction = await stakingRewards.setRewardsDuration(seventyDays, { from: owner });
			assert.eventEqual(transaction, 'RewardsDurationUpdated', {
				newDuration: seventyDays,
			});

			const newDuration = await stakingRewards.rewardsDuration();
			assert.bnEqual(newDuration, seventyDays);

			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY * 71);
			await stakingRewards.getReward({ from: stakingAccount1 });
		});
	});

	describe('getRewardForDuration()', () => {
		it('should increase rewards token balance', async () => {
			const totalToDistribute = toUnit('5000');
			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(totalToDistribute, {
				from: mockRewardsDistributionAddress,
			});

			const rewardForDuration = await stakingRewards.getRewardForDuration();

			const duration = await stakingRewards.rewardsDuration();
			const rewardRate = await stakingRewards.rewardRate();

			assert.bnGt(rewardForDuration, ZERO_BN);
			assert.bnEqual(rewardForDuration, duration.mul(rewardRate));
		});
	});

	describe('withdraw()', () => {
		it('cannot withdraw if nothing staked', async () => {
			await assert.revert(stakingRewards.withdraw(toUnit('100')), 'SafeMath: subtraction overflow');
		});

		it('should increases lp token balance and decreases staking balance', async () => {
			const totalToStake = toUnit('100');
			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			const initialStakingTokenBal = await stakingToken.balanceOf(stakingAccount1);
			const initialStakeBal = await stakingRewards.balanceOf(stakingAccount1);

			await stakingRewards.withdraw(totalToStake, { from: stakingAccount1 });

			const postStakingTokenBal = await stakingToken.balanceOf(stakingAccount1);
			const postStakeBal = await stakingRewards.balanceOf(stakingAccount1);

			assert.bnEqual(postStakeBal.add(toBN(totalToStake)), initialStakeBal);
			assert.bnEqual(initialStakingTokenBal.add(toBN(totalToStake)), postStakingTokenBal);
		});

		it('cannot withdraw 0', async () => {
			await assert.revert(stakingRewards.withdraw('0'), 'Cannot withdraw 0');
		});
	});

	describe('exit()', () => {
		it('should retrieve all earned and increase rewards bal', async () => {
			const totalToStake = toUnit('100');
			const totalToDistribute = toUnit('5000');

			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			await rewardsToken.transfer(stakingRewards.address, totalToDistribute, { from: owner });
			await stakingRewards.notifyRewardAmount(toUnit(5000.0), {
				from: mockRewardsDistributionAddress,
			});

			await fastForward(DAY);

			const initialRewardBal = await rewardsToken.balanceOf(stakingAccount1);
			const initialEarnedBal = await stakingRewards.earned(stakingAccount1);
			await stakingRewards.exit({ from: stakingAccount1 });
			const postRewardBal = await rewardsToken.balanceOf(stakingAccount1);
			const postEarnedBal = await stakingRewards.earned(stakingAccount1);

			assert.bnLt(postEarnedBal, initialEarnedBal);
			assert.bnGt(postRewardBal, initialRewardBal);
			assert.bnEqual(postEarnedBal, ZERO_BN);
		});
	});

	describe('notifyRewardAmount()', () => {
		let localStakingRewards;

		before(async () => {
			localStakingRewards = await setupContract({
				accounts,
				contract: 'StakingRewards',
				args: [owner, rewardsDistribution.address, rewardsToken.address, stakingToken.address],
			});

			await localStakingRewards.setRewardsDistribution(mockRewardsDistributionAddress, {
				from: owner,
			});
		});

		it('Reverts if the provided reward is greater than the balance.', async () => {
			const rewardValue = toUnit(1000);
			await rewardsToken.transfer(localStakingRewards.address, rewardValue, { from: owner });
			await assert.revert(
				localStakingRewards.notifyRewardAmount(rewardValue.add(toUnit(0.1)), {
					from: mockRewardsDistributionAddress,
				}),
				'Provided reward too high'
			);
		});

		it('Reverts if the provided reward is greater than the balance, plus rolled-over balance.', async () => {
			const rewardValue = toUnit(1000);
			await rewardsToken.transfer(localStakingRewards.address, rewardValue, { from: owner });
			localStakingRewards.notifyRewardAmount(rewardValue, {
				from: mockRewardsDistributionAddress,
			});
			await rewardsToken.transfer(localStakingRewards.address, rewardValue, { from: owner });
			// Now take into account any leftover quantity.
			await assert.revert(
				localStakingRewards.notifyRewardAmount(rewardValue.add(toUnit(0.1)), {
					from: mockRewardsDistributionAddress,
				}),
				'Provided reward too high'
			);
		});
	});

	describe('Integration Tests', () => {
		before(async () => {
			// Set rewardDistribution address
			await stakingRewards.setRewardsDistribution(rewardsDistribution.address, {
				from: owner,
			});
			assert.equal(await stakingRewards.rewardsDistribution(), rewardsDistribution.address);

			await setRewardsTokenExchangeRate();
		});

		it('stake and claim', async () => {
			// Transfer some LP Tokens to user
			const totalToStake = toUnit('500');
			await stakingToken.transfer(stakingAccount1, totalToStake, { from: owner });

			// Stake LP Tokens
			await stakingToken.approve(stakingRewards.address, totalToStake, { from: stakingAccount1 });
			await stakingRewards.stake(totalToStake, { from: stakingAccount1 });

			// Distribute some rewards
			const totalToDistribute = toUnit('35000');
			assert.equal(await rewardsDistribution.distributionsLength(), 0);
			await rewardsDistribution.addRewardDistribution(stakingRewards.address, totalToDistribute, {
				from: owner,
			});
			assert.equal(await rewardsDistribution.distributionsLength(), 1);

			// Transfer Rewards to the RewardsDistribution contract address
			await rewardsToken.transfer(rewardsDistribution.address, totalToDistribute, { from: owner });

			// Distribute Rewards called from Synthetix contract as the authority to distribute
			await rewardsDistribution.distributeRewards(totalToDistribute, {
				from: authority,
			});

			// Period finish should be ~7 days from now
			const periodFinish = await stakingRewards.periodFinish();
			const curTimestamp = await currentTime();
			assert.equal(parseInt(periodFinish.toString(), 10), curTimestamp + DAY * 7);

			// Reward duration is 7 days, so we'll
			// Fastforward time by 6 days to prevent expiration
			await fastForward(DAY * 6);

			// Reward rate and reward per token
			const rewardRate = await stakingRewards.rewardRate();
			assert.bnGt(rewardRate, ZERO_BN);

			const rewardPerToken = await stakingRewards.rewardPerToken();
			assert.bnGt(rewardPerToken, ZERO_BN);

			// Make sure we earned in proportion to reward per token
			const rewardRewardsEarned = await stakingRewards.earned(stakingAccount1);
			assert.bnEqual(rewardRewardsEarned, rewardPerToken.mul(totalToStake).div(toUnit(1)));

			// Make sure after withdrawing, we still have the ~amount of rewardRewards
			// The two values will be a bit different as time has "passed"
			const initialWithdraw = toUnit('100');
			await stakingRewards.withdraw(initialWithdraw, { from: stakingAccount1 });
			assert.bnEqual(initialWithdraw, await stakingToken.balanceOf(stakingAccount1));

			const rewardRewardsEarnedPostWithdraw = await stakingRewards.earned(stakingAccount1);
			assert.bnClose(rewardRewardsEarned, rewardRewardsEarnedPostWithdraw, toUnit('0.1'));

			// Get rewards
			const initialRewardBal = await rewardsToken.balanceOf(stakingAccount1);
			await stakingRewards.getReward({ from: stakingAccount1 });
			const postRewardRewardBal = await rewardsToken.balanceOf(stakingAccount1);

			assert.bnGt(postRewardRewardBal, initialRewardBal);

			// Exit
			const preExitLPBal = await stakingToken.balanceOf(stakingAccount1);
			await stakingRewards.exit({ from: stakingAccount1 });
			const postExitLPBal = await stakingToken.balanceOf(stakingAccount1);
			assert.bnGt(postExitLPBal, preExitLPBal);
		});
	}); */
});
