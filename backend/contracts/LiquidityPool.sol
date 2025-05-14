// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./EggCoin.sol";

contract LiquidityPool is AccessControl {
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant INVESTOR_ROLE = keccak256("INVESTOR_ROLE");
    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    IERC20 public usdcToken;
    EggCoin public eggToken;
    address public loanManager;

    struct Investor {
        uint256 usdcDeposited;
        uint256 eggMinted;
        uint256 depositTimestamp;
    }

    mapping(address => Investor) public investors;

    constructor(address _usdc, address _egg, address developer, address farmer, address investor, address vendor) {
        usdcToken = IERC20(_usdc);
        eggToken = EggCoin(_egg);
        
        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, developer);
        _grantRole(DEVELOPER_ROLE, developer);
        _grantRole(FARMER_ROLE, farmer);
        _grantRole(INVESTOR_ROLE, investor);
        _grantRole(VENDOR_ROLE, vendor);
    }

    function setLoanManager(address _loanManager) external onlyRole(DEVELOPER_ROLE) {
        require(_loanManager != address(0), "Invalid loan manager address");
        loanManager = _loanManager;
        eggToken.approveForContract(_loanManager, type(uint256).max);
    }

    function depositUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");
        
        eggToken.mint(msg.sender, amount);
        
        investors[msg.sender] = Investor({
            usdcDeposited: investors[msg.sender].usdcDeposited + amount,
            eggMinted: investors[msg.sender].eggMinted + amount,
            depositTimestamp: block.timestamp
        });
    }

    function withdrawUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(investors[msg.sender].eggMinted >= amount, "Insufficient EggCoin balance");
        
        eggToken.burn(msg.sender, amount);
        require(usdcToken.transfer(msg.sender, amount), "USDC transfer failed");
        
        investors[msg.sender].usdcDeposited -= amount;
        investors[msg.sender].eggMinted -= amount;
    }

    function setEggToken(address _egg) external onlyRole(DEVELOPER_ROLE) {
        eggToken = EggCoin(_egg);
    }
}
