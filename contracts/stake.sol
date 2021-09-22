pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking {
    using SafeMath for uint256;

    IERC20 public stakeToken;
    uint256 private _totalSupply;
    /* mapping(address => uint256) private _balances;
    mapping(address => uint256) private _stakingStarts; */
    mapping(address => Stake) private _stakes;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    struct Stake {
      uint: start;
      uint: end;
      uint: amount;
    }

    function stake(uint256 amount, uint256 duration) public {
        require(amount > 0, "Cannot stake 0");
        require(duration > 0, "Cannot stake for zero duration");

        _totalSupply = _totalSupply.add(amount);
        uint256 end = block.timestamp.add(duration);
        _stakes[msg.sender] = Stakes(block.timestamp, end, amount);

        stakeToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake() public {
        require(_balances[msg.sender] > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakeToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function getReward()
  public
  {
    uint256 reward = earned(msg.sender);
    if (reward > 0) {
      rewardToken.transfer(msg.sender, reward);
      emit RewardPaid(msg.sender, reward);
    }
  }

  function earned(address account)
  public
  view
  returns (uint256)
  {
    uint 
    return
    balanceOf(account)
    .mul(rewardPerToken())
    .div(1e18)
    .add(rewards[account]);
  }
}
