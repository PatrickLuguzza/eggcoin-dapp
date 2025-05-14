// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Using our custom ReentrancyGuard implementation
import "./EggCoin.sol";

contract StakingPool is Ownable, ReentrancyGuard {
    IERC20 public immutable eggToken;
    uint256 public rewardRate = 10; // 10% APY
    uint256 public totalStaked;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
    }
    
    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address _eggToken) Ownable(msg.sender) {
        require(_eggToken != address(0), "Invalid token address");
        eggToken = IERC20(_eggToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(eggToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender] = Stake({
            amount: amount,
            startTime: block.timestamp
        });
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    function unstake() external nonReentrant {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake to withdraw");
        
        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;
        
        totalStaked -= userStake.amount;
        delete stakes[msg.sender];
        
        require(eggToken.transfer(msg.sender, totalAmount), "Transfer failed");
        emit Unstaked(msg.sender, userStake.amount, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.startTime;
        return (userStake.amount * rewardRate * stakingDuration) / (365 days * 100);
    }

    function setRewardRate(uint256 _rate) external onlyOwner {
        require(_rate <= 100, "Rate too high"); // Max 100% APY
        rewardRate = _rate;
    }
}
