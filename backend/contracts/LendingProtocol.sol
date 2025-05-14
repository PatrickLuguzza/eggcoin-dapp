// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EggCoin.sol";

contract LendingProtocol is Ownable, ReentrancyGuard {
    IERC20 public immutable eggToken;
    uint256 public lendingRate = 5; // 5% APY
    uint256 public borrowingRate = 15; // 15% APY
    
    struct Loan {
        uint256 amount;
        uint256 startTime;
    }
    
    mapping(address => uint256) public deposits;
    mapping(address => Loan) public loans;
    uint256 public totalDeposited;
    uint256 public totalBorrowed;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 interest);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount, uint256 interest);

    constructor(address _eggToken) Ownable(msg.sender) {
        require(_eggToken != address(0), "Invalid token address");
        eggToken = IERC20(_eggToken);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(eggToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        deposits[msg.sender] += amount;
        totalDeposited += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalAmount = amount + interest;
        
        deposits[msg.sender] -= amount;
        totalDeposited -= amount;
        
        require(eggToken.transfer(msg.sender, totalAmount), "Transfer failed");
        emit Withdrawn(msg.sender, amount, interest);
    }

    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= availableLiquidity(), "Insufficient liquidity");
        
        loans[msg.sender] = Loan(amount, block.timestamp);
        totalBorrowed += amount;
        
        require(eggToken.transfer(msg.sender, amount), "Transfer failed");
        emit Borrowed(msg.sender, amount);
    }

    function repay() external nonReentrant {
        Loan memory loan = loans[msg.sender];
        require(loan.amount > 0, "No loan to repay");
        
        uint256 interest = calculateLoanInterest(msg.sender);
        uint256 totalAmount = loan.amount + interest;
        
        totalBorrowed -= loan.amount;
        delete loans[msg.sender];
        
        require(eggToken.transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");
        emit Repaid(msg.sender, loan.amount, interest);
    }

    function calculateInterest(address user) public view returns (uint256) {
        if (deposits[user] == 0) return 0;
        return (deposits[user] * lendingRate) / 100;
    }

    function calculateLoanInterest(address user) public view returns (uint256) {
        Loan memory loan = loans[user];
        if (loan.amount == 0) return 0;
        
        uint256 loanDuration = block.timestamp - loan.startTime;
        return (loan.amount * borrowingRate * loanDuration) / (365 days * 100);
    }

    function availableLiquidity() public view returns (uint256) {
        return totalDeposited - totalBorrowed;
    }

    function setRates(uint256 _lendingRate, uint256 _borrowingRate) external onlyOwner {
        require(_lendingRate <= 100, "Lending rate too high");
        require(_borrowingRate <= 100, "Borrowing rate too high");
        lendingRate = _lendingRate;
        borrowingRate = _borrowingRate;
    }
}
