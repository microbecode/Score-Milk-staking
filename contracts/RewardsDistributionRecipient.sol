pragma solidity ^0.5.0;

// Inheritance
import "./ownership/Ownable.sol";

// https://docs.synthetix.io/contracts/source/contracts/rewardsdistributionrecipient
contract RewardsDistributionRecipient is Ownable {
    address public rewardsDistribution;

    function notifyRewardAmount() external payable;

    modifier onlyRewardsDistribution() {
        require(
            msg.sender == rewardsDistribution,
            "Caller is not RewardsDistribution contract"
        );
        _;
    }

    function setRewardsDistribution(address _rewardsDistribution)
        external
        onlyOwner
    {
        rewardsDistribution = _rewardsDistribution;
    }
}
