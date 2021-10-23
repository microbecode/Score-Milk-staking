# Contract documentation

This documentation is explaining the contract functionalities. Please see the root folder's documentation for project documentation.

## Staking

The staking contract is based on the staking contract by Synthetix (https://github.com/Synthetixio/synthetix/blob/c53070db9a93e5717ca7f74fcaf3922e991fb71b/contracts/StakingRewards.sol). The contract has been kept as close to the original as possible.

### Functionalities

The contract provides the following main functionalities:
* For user:
  * Stake. Any amount of stakers can stake. Used also for increasing your current stake
  * Unstake. Can unstake any amount
  * Withdraw rewards. Can only withdraw all of the accumulated rewards. Does not end staking
* For owner:
  * Add rewards
  * Change staking period duration (only when there is no staking period ongoing)
  * Pause staking. Pausing possibility does not apply to any other functionality

The contract distributes the staking rewards fairly among the stakers. That is, if user A stakes 100 tokens for a week and B stakes 50 tokens for a week (or 100 for half a week), A gets twice as much rewards as B.

The staking token can be any ERC20 compatible token. The rewards are in blockchain's native asset (for example Ether in Ethereum network).

#### Staking period

The staking period is an internal construct, and is typically not visible for the end users in any way. By default the staking period is 7 days.

A staking period starts by the owner (or, to be more precise, a *reward distributer*) entering rewards into the contract. Starting from that point onwards, the stakers accumulate rewards. All the input rewards are distributed during that staking period. Once the staking period ends, nobody accumulates rewards until a new period is started explicitly. Also, more rewards can be added during a staking period, and those are distributed fairly to stakers.

When a user stakes, he does not stake for any staking period, but the staking period is open ended. User only decides how many tokens he wants to stake and he can unstake whenever he wants to.

#### Milestone calculations

TODO

#### Staking algorithm

The algorithm used by the staking contract is rather elegant, but complicated. There is no looping and the contract scales up fully - which means that regardless of the amount of stakers, the usage costs remain the same.

You can learn about the algorithm in this awesome video series: https://www.youtube.com/watch?v=6ZO5aYg1GI8 .

#### Comparison with the original Synthetix contract

The following modifications have been made to the original staking contract:
* The imports are local, instead of from node packages
* Replaced the concept of *rewardsToken* with native asset
* When staking or unstaking, add a record to a custom new data structure about the action. The record contains the timestamp and the staked/unstaked amount, per address
* Added *view* function *checkMilestoneEligibility* which interprets the staking/unstaking actions to determine whether the staker is eligible for certain milestone rewards
* Added comments to functions
* Changed the used interface *IStakingRewards* to conform to the changed functionality. Chaned the inherited support contract *RewardsDistributionRecipient* to conform to the changed functionality

## Minter

TODO

## NFTs 

TODO
