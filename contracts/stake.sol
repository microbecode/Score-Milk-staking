pragma solidity ^0.5.0;

import "./token/ERC20/IERC20.sol";
import "./math/SafeMath.sol";

contract Staking {
    using SafeMath for uint256;

    IERC20 public stakeToken;
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
        uint256 end;
        uint256 amount;
    }

    function stake(uint256 amount, uint256 duration) public {
        require(amount > 0, "Cannot stake 0");
        require(duration > 0, "Cannot stake for zero duration");

        _totalStakes = _totalStakes.add(amount);
        uint256 end = block.timestamp.add(duration);
        _stakes[msg.sender] = Stake(block.timestamp, end, amount);

        stakeToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake() public {
        require(_stakes[msg.sender].amount > 0, "Cannot unstake 0");
        _totalStakes = _totalStakes.sub(_stakes[msg.sender].amount);
        _stakes[msg.sender].amount = 0;
        stakeToken.transfer(msg.sender, _stakes[msg.sender].amount);
        emit Unstaked(msg.sender, _stakes[msg.sender].amount);
    }

    function getReward() public {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            // TODO Transfer reward
            emit RewardPaid(msg.sender, reward);
        }
    }

    function earned(address account) public view returns (uint256) {
        // Multiply all amounts by this to avoid rounding issues. Divide in the end
        uint256 tempMultiplier = 1000000;

        // How long we have staked for
        uint256 duration = block.timestamp - _stakes[account].start;
        // One year would give 1-to-1 reward. Multiply based on that
        uint256 timeMultiplier = (duration / 365 days) * tempMultiplier;
        // How big percentage we have of the total staked amount
        uint256 percentageMultiplier = (_stakes[account].amount /
            _totalStakes) * tempMultiplier;

        return
            _stakes[account]
                .amount
                .mul(timeMultiplier)
                .mul(percentageMultiplier)
                .div(tempMultiplier * tempMultiplier); // divide twice, since we multiplied with it twice
    }
}
