pragma solidity ^0.5.0;

import "./token/ERC20/IERC20.sol";
import "./math/SafeMath.sol";
import "hardhat/console.sol";

contract Staking {
    using SafeMath for uint256;

    IERC20 public _stakeToken;
    uint256 private _totalStakes;
    /* mapping(address => uint256) private _balances;
    mapping(address => uint256) private _stakingStarts; */
    mapping(address => Stake) private _stakes;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    struct Stake {
        uint256 start;
        uint256 amount;
    }

    constructor(address stakeToken) public {
        _stakeToken = IERC20(stakeToken);
    }

    function() external payable {
        //console.log("I got money %s", address(this).balance);
    }

    function stake(uint256 amount) public {
        require(amount > 0, "Cannot stake 0");

        _stakeToken.transferFrom(msg.sender, address(this), amount);

        if (_stakes[msg.sender].amount > 0) {
            // Already has an existing stake. Settle that and start a new stake
            amount = amount.add(_stakes[msg.sender].amount);
            removeStake(false);
        }

        _totalStakes = _totalStakes.add(amount);
        _stakes[msg.sender] = Stake(block.timestamp, amount);

        emit Staked(msg.sender, amount);
        console.log("stake balance is %s", _stakes[msg.sender].amount);
    }

    function unstake() public {
        removeStake(true);
    }

    function removeStake(bool returnTokens) private {
        uint256 stakeAmount = _stakes[msg.sender].amount;
        console.log("stakeAmount %s", stakeAmount);
        require(stakeAmount > 0, "Cannot unstake 0");
        _totalStakes = _totalStakes.sub(stakeAmount);

        if (returnTokens) {
            _stakeToken.transfer(msg.sender, stakeAmount);
        }

        withdrawReward();

        emit Unstaked(msg.sender, stakeAmount);
    }

    function withdrawReward() private {
        uint256 reward = getRewardAmount(msg.sender);
        _stakes[msg.sender].amount = 0;
        if (reward > 0) {
            (bool success, ) = msg.sender.call.value(reward)("");
            require(success, "Transfer failed.");
            emit RewardPaid(msg.sender, reward);
        }
    }

    function getStakeAmount(address addr) public view returns (uint256) {
        return _stakes[addr].amount;
    }

    uint256 rewardPerHour = 1000;

    function getRewardAmount(address account) public view returns (uint256) {
        return
            getRewardAmountForMoment(
                _stakes[account].start,
                block.timestamp,
                _stakes[account].amount,
                _totalStakes
            );
    }

    function getRewardAmountForMoment(
        uint256 startTime,
        uint256 nowTime,
        uint256 stakeAmount,
        uint256 totalStakes
    ) public view returns (uint256) {
        /* if (_totalStakes == 0) {
            return 0;
        } */
        //uint256 duration = nowTime - startTime;
        // Multiply all amounts by this to avoid rounding issues. Divide in the end
        /*         uint256 tempMultiplier = 10000;

        // How long we have staked for
        
        // Fee amount = 1 day of fees
        //uint256 fee = (1 days / duration) * tempMultiplier;
        // One year would give 1-to-1 reward. Multiply based on that
        uint256 timeMultiplier = (duration / 365 days) * tempMultiplier;
        // How big percentage we have of the total staked amount
        uint256 percentageMultiplier = (_stakes[account].amount /
            _totalStakes) * tempMultiplier; */

        uint256 reward = (((nowTime - startTime) / 1 hours) *
            (((stakeAmount * stakeAmount) / totalStakes))) / rewardPerHour;
        console.log("reward %s and %s, %s", reward, stakeAmount, totalStakes);
        return reward;

        /*         return
            _stakes[account]
                .amount
                .mul(duration / 1 hours)
                .mul(stakeAmount)
                .div(rewardPerHour); */
        //.div(tempMultiplier**2);
        //       .div(fee) // divide thrice, since we multiplied with it that many times
    }
}
