// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./EggCoin.sol";

interface IYieldPool {
    function depositInterest(uint256 amount) external;
}

contract LoanManager is AccessControl {
    bytes32 public constant DEVELOPER_ROLE = keccak256("DEVELOPER_ROLE");
    
    EggCoin public eggToken;
    address public liquidityPool;
    address public yieldPool;

    struct Farmer {
        bool isRegistered;
        uint256 creditScore;
        uint256[] eggLogs;
        uint256 lastLoanTimestamp;
    }

    struct Loan {
        address farmer;
        uint256 amount;
        uint256 interestRate;
        uint256 repaymentDeadline;
        bool isRepaid;
    }

    mapping(address => Farmer) public farmers;
    Loan[] public loans;
    uint256 public constant INTEREST_RATE = 5; // 5%

    constructor(address _egg, address _yieldPool, address developer) {
        eggToken = EggCoin(_egg);
        yieldPool = _yieldPool;
        _grantRole(DEFAULT_ADMIN_ROLE, developer);
        _grantRole(DEVELOPER_ROLE, developer);
    }

    function registerFarmer(address farmer, uint256 initialCreditScore) external onlyRole(DEVELOPER_ROLE) {
        farmers[farmer] = Farmer({
            isRegistered: true,
            creditScore: initialCreditScore,
            eggLogs: new uint256[](0),
            lastLoanTimestamp: 0
        });
    }

    function logEggProduction(address farmer, uint256 eggCount) external onlyRole(DEVELOPER_ROLE) {
        require(farmers[farmer].isRegistered, "Farmer not registered");
        farmers[farmer].eggLogs.push(eggCount);
    }

    function requestLoan(uint256 amount) external {
        Farmer storage farmer = farmers[msg.sender];
        require(farmer.isRegistered, "Farmer not registered");
        require(farmer.eggLogs.length >= 7, "Insufficient egg logs");
        require(farmer.creditScore >= 50, "Credit score too low");
        require(block.timestamp - farmer.lastLoanTimestamp > 30 days, "Too soon since last loan");

        loans.push(Loan({
            farmer: msg.sender,
            amount: amount,
            interestRate: INTEREST_RATE,
            repaymentDeadline: block.timestamp + 90 days,
            isRepaid: false
        }));

        eggToken.transferFrom(liquidityPool, msg.sender, amount);
        farmer.lastLoanTimestamp = block.timestamp;
    }

    function repayLoan(uint256 loanId) external {
        require(loanId < loans.length, "Invalid loan ID");
        Loan storage loan = loans[loanId];
        require(loan.farmer == msg.sender, "Not your loan");
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp <= loan.repaymentDeadline, "Loan overdue");
        
        eggToken.burn(msg.sender, loan.amount);
        uint256 interestAmount = loan.amount * loan.interestRate / 100;
        eggToken.transferFrom(msg.sender, yieldPool, interestAmount);
        IYieldPool(yieldPool).depositInterest(interestAmount);

        loan.isRepaid = true;
    }

    function setLiquidityPool(address _liquidityPool) external onlyRole(DEVELOPER_ROLE) {
        liquidityPool = _liquidityPool;
    }

    function setYieldPool(address _yieldPool) external onlyRole(DEVELOPER_ROLE) {
        yieldPool = _yieldPool;
    }
}
