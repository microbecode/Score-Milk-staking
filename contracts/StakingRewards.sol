pragma solidity ^0.5.0;

import "./token/ERC20/SafeERC20.sol";

import "./utils/ReentrancyGuard.sol";

// Inheritance
import "./interfaces/IStakingRewards.sol";
import "./RewardsDistributionRecipient.sol";
import "./Pausable.sol";

import "./token/ERC20/IERC20.sol";
import "./math/SafeMath.sol";
import "hardhat/console.sol";
import "./NFTFirst.sol";
import "./NFTSecond.sol";
import "./NFTThird.sol";

// https://docs.synthetix.io/contracts/source/contracts/stakingrewards
contract StakingRewards is
    IStakingRewards,
    RewardsDistributionRecipient,
    ReentrancyGuard,
    Pausable
{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public stakingToken;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    NFTFirst public _nftFirst;
    NFTSecond public _nftSecond;
    NFTThird public _nftThird;
    NFTLimit public nftLimitsFirst;
    NFTLimit public nftLimitsSecond;
    NFTLimit public nftLimitsThird;
    mapping(address => uint256) public stakerFirstNFTThreshholdTimestamp;
    mapping(address => uint256) public stakerSecondNFTThreshholdTimestamp;
    mapping(address => uint256) public stakerThirdNFTThreshholdTimestamp;

    struct NFTLimit {
        uint256 amount;
        uint256 duration;
    }

    bool private nftAddressesSet = false;
    uint256 private MAX_INT = 2**256 - 1;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _owner,
        address _rewardsDistribution,
        address _stakingToken
    ) public Owned(_owner) {
        stakingToken = IERC20(_stakingToken);
        rewardsDistribution = _rewardsDistribution;
    }

    /* ========== VIEWS ========== */

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(_totalSupply)
            );
    }

    // How much an account has earned so far
    function earned(address account) public view returns (uint256) {
        return
            _balances[account]
                .mul(rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18)
                .add(rewards[account]);
    }

    function getRewardForDuration() external view returns (uint256) {
        return rewardRate.mul(rewardsDuration);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    function stake(uint256 amount)
        external
        nonReentrant
        notPaused
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot stake 0");
        _totalSupply = _totalSupply.add(amount);
        _balances[msg.sender] = _balances[msg.sender].add(amount);
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        updateNFTEligibility();
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount)
        public
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        updateNFTEligibility();
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = msg.sender.call.value(reward)("");
            require(success, "Reward transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }

    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    function updateNFTEligibility() internal {
        if (
            nftLimitsFirst.amount <= _balances[msg.sender] &&
            stakerFirstNFTThreshholdTimestamp[msg.sender] == 0
        ) {
            stakerFirstNFTThreshholdTimestamp[msg.sender] = block.timestamp;
        }
        if (
            nftLimitsFirst.amount > _balances[msg.sender] &&
            stakerFirstNFTThreshholdTimestamp[msg.sender] != MAX_INT
        ) {
            stakerFirstNFTThreshholdTimestamp[msg.sender] = 0;
        }

        if (
            nftLimitsSecond.amount <= _balances[msg.sender] &&
            stakerSecondNFTThreshholdTimestamp[msg.sender] == 0
        ) {
            stakerSecondNFTThreshholdTimestamp[msg.sender] = block.timestamp;
        }
        if (
            nftLimitsSecond.amount > _balances[msg.sender] &&
            stakerSecondNFTThreshholdTimestamp[msg.sender] != MAX_INT
        ) {
            stakerSecondNFTThreshholdTimestamp[msg.sender] = 0;
        }

        if (
            nftLimitsThird.amount <= _balances[msg.sender] &&
            stakerThirdNFTThreshholdTimestamp[msg.sender] == 0
        ) {
            stakerThirdNFTThreshholdTimestamp[msg.sender] = block.timestamp;
        }
        if (
            nftLimitsThird.amount > _balances[msg.sender] &&
            stakerThirdNFTThreshholdTimestamp[msg.sender] != MAX_INT
        ) {
            stakerThirdNFTThreshholdTimestamp[msg.sender] = 0;
        }
    }

    function getNFT() public {
        if (
            stakerFirstNFTThreshholdTimestamp[msg.sender] > 0 &&
            block.timestamp - stakerFirstNFTThreshholdTimestamp[msg.sender] >
            nftLimitsFirst.duration
        ) {
            _nftFirst.mint(msg.sender);
            stakerFirstNFTThreshholdTimestamp[msg.sender] = MAX_INT;
        }
        if (
            stakerSecondNFTThreshholdTimestamp[msg.sender] > 0 &&
            block.timestamp - stakerSecondNFTThreshholdTimestamp[msg.sender] >
            nftLimitsSecond.duration
        ) {
            _nftSecond.mint(msg.sender);
            stakerSecondNFTThreshholdTimestamp[msg.sender] = MAX_INT;
        }
        if (
            stakerThirdNFTThreshholdTimestamp[msg.sender] > 0 &&
            block.timestamp - stakerThirdNFTThreshholdTimestamp[msg.sender] >
            nftLimitsThird.duration
        ) {
            _nftThird.mint(msg.sender);
            stakerThirdNFTThreshholdTimestamp[msg.sender] = MAX_INT;
        }
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    function setNFTAddresses(
        address nftFirst,
        address nftSecond,
        address nftThird
    ) public onlyOwner {
        require(!nftAddressesSet, "You can only set addresses once");
        _nftFirst = NFTFirst(nftFirst);
        _nftSecond = NFTSecond(nftSecond);
        _nftThird = NFTThird(nftThird);

        nftAddressesSet = true;

        nftLimitsFirst = NFTLimit(10e18, 10);
        nftLimitsSecond = NFTLimit(10e19, 100);
        nftLimitsThird = NFTLimit(10e20, 1000);
    }

    function notifyRewardAmount()
        external
        payable
        onlyRewardsDistribution
        updateReward(address(0))
    {
        require(msg.value > 0, "Can't insert zero reward");
        if (block.timestamp >= periodFinish) {
            rewardRate = msg.value.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = msg.value.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = address(this).balance;
        require(
            rewardRate <= balance.div(rewardsDuration),
            "Provided reward too high"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(msg.value);
    }

    // Added to support recovering LP Rewards from other systems such as BAL to be distributed to holders
    function recoverERC20(address tokenAddress, uint256 tokenAmount)
        external
        onlyOwner
    {
        require(
            tokenAddress != address(stakingToken),
            "Cannot withdraw the staking token"
        );
        IERC20(tokenAddress).safeTransfer(owner, tokenAmount);
        emit Recovered(tokenAddress, tokenAmount);
    }

    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /* ========== EVENTS ========== */

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardsDurationUpdated(uint256 newDuration);
    event Recovered(address token, uint256 amount);
}
