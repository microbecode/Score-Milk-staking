pragma solidity ^0.5.0;

import "./token/ERC20/SafeERC20.sol";
import "./utils/ReentrancyGuard.sol";

// Inheritance
import "./interfaces/IStakingRewards.sol";
import "./RewardsDistributionRecipient.sol";
import "./Pausable.sol";

import "./token/ERC20/IERC20.sol";
import "./math/SafeMath.sol";

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

    struct StakingAction {
        int256 amount;
        uint256 timestamp;
    }

    mapping(address => StakingAction[]) public stakingActions;

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

    /** @dev Returns the last moment the rewards can be calculated for
     * @return Current timestamp or the staking period's end timestamp - whichever is earlier
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /** @dev How much rewards should a single token give
     */
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

    /** @dev How much rewards has an account accumulated so far
     */
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

    /** @dev Checks whether an account is eligible for some staking milestone
     * @param staker Address of the staker to check
     * @param amount The minimum amount of tokens the user needs to have staked, for the milestone
     * @param duration The minimum duration for the staker to have staked the amount of tokens, for the milestone
     * @return true if eligible, false otherwise
     */
    function checkMilestoneEligibility(
        address staker,
        uint256 amount,
        uint256 duration
    ) public view returns (bool) {
        int256 currentStake = 0;
        uint256 milestoneAmountHeldFrom = 0;

        for (uint256 i = 0; i < stakingActions[staker].length; i++) {
            if (
                milestoneAmountHeldFrom > 0 &&
                stakingActions[staker][i].timestamp - milestoneAmountHeldFrom >=
                duration
            ) {
                // If we are eligible based on the newest action's timestamp
                return true;
            }

            currentStake += stakingActions[staker][i].amount;

            if (currentStake >= int256(amount)) {
                // If we're above the threshold
                if (milestoneAmountHeldFrom == 0) {
                    // If timestamp not set yet
                    milestoneAmountHeldFrom = stakingActions[staker][i]
                        .timestamp;
                }
            } else {
                milestoneAmountHeldFrom = 0;
            }
        }
        // Check eligibility after the last entry
        if (
            milestoneAmountHeldFrom > 0 &&
            block.timestamp - milestoneAmountHeldFrom >= duration
        ) {
            return true;
        }
        return false;
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /** @dev Add a stake or increases an existing stake
     * @param amount How many tokens to stake
     */
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
        addStakingAction(int256(amount));
        emit Staked(msg.sender, amount);
    }

    /** @dev Unstake some amount of tokens
     * @param amount The amount of tokens to unstake
     */
    function withdraw(uint256 amount)
        public
        nonReentrant
        updateReward(msg.sender)
    {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply = _totalSupply.sub(amount);
        _balances[msg.sender] = _balances[msg.sender].sub(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        addStakingAction(int256(-amount));
        emit Withdrawn(msg.sender, amount);
    }

    /** @dev Withdraws all of the currently accumulated rewards. Does not unstake
     */
    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            (bool success, ) = msg.sender.call.value(reward)("");
            require(success, "Reward transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }

    /** @dev Unstakes everything and withdraws all rewards
     */
    function exit() external {
        withdraw(_balances[msg.sender]);
        getReward();
    }

    function addStakingAction(int256 amount) internal {
        stakingActions[msg.sender].push(
            StakingAction(int256(amount), block.timestamp)
        );
    }

    /* ========== RESTRICTED FUNCTIONS ========== */

    /** @dev Add rewards to the contract. The rewards are in the format of the blockchain's native assets (msg.value)
     */
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

    /** @dev Recover an arbitrary ERC20 token from the contract. Useful if wrong tokens were sent here accidentally
     */
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

    /** @dev Changes the reward duration. Only possible when a staking period is not running
     */
    function setRewardsDuration(uint256 _rewardsDuration) external onlyOwner {
        require(
            block.timestamp > periodFinish,
            "Previous rewards period must be complete before changing the duration for the new period"
        );
        rewardsDuration = _rewardsDuration;
        emit RewardsDurationUpdated(rewardsDuration);
    }

    /* ========== MODIFIERS ========== */

    /** @dev Updates reward information for a user
     */
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
