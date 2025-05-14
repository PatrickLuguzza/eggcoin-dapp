// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EggCoin.sol";
import "./LiquidityPool.sol";

contract YieldPool is Ownable {
    EggCoin public eggToken;
    LiquidityPool public liquidityPool;
    address public loanManager;

    uint256 public totalYield;
    mapping(address => uint256) public investorClaims;
    mapping(address => uint256) public investorYieldShare;

    constructor(address _egg, address _liquidityPool, address _loanManager) Ownable(msg.sender) {
        eggToken = EggCoin(_egg);
        liquidityPool = LiquidityPool(_liquidityPool);
        loanManager = _loanManager;
    }

    function depositInterest(uint256 amount) external {
        require(
            msg.sender == owner() || 
            msg.sender == address(liquidityPool) || 
            msg.sender == address(loanManager),
            "Not authorized"
        );
        totalYield += amount;
    }

    function calculateYieldShare(address investor) public view returns (uint256) {
        (uint256 usdcDeposited,, uint256 depositTimestamp) = getInvestorInfo(investor);
        if (usdcDeposited == 0) return 0;

        uint256 duration = block.timestamp - depositTimestamp;
        return (usdcDeposited * duration) / (1 days);
    }

    function updateInvestorYield(address investor) public {
        uint256 newShare = calculateYieldShare(investor);
        uint256 existingShare = investorYieldShare[investor];
        
        if (newShare > existingShare) {
            uint256 additionalShare = newShare - existingShare;
            investorYieldShare[investor] = newShare;
            totalYield += additionalShare;
        }
    }

    function claimYield() external {
        updateInvestorYield(msg.sender);
        uint256 share = investorYieldShare[msg.sender];
        require(share > 0, "No yield to claim");

        uint256 amount = (share * totalYield) / (1 ether);
        investorYieldShare[msg.sender] = 0;
        totalYield -= share;

        eggToken.mint(msg.sender, amount);
    }

    function getInvestorInfo(address investor) internal view returns (
        uint256 usdcDeposited,
        uint256 eggMinted,
        uint256 depositTimestamp
    ) {
        (uint256 deposited, uint256 minted, uint256 timestamp) = liquidityPool.investors(investor);
        return (deposited, minted, timestamp);
    }
}
