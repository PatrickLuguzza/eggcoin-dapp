// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

// Custom ReentrancyGuard implementation
abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract EggCoin is ERC20, AccessControl, ERC20Permit, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address public liquidityPool;
    address public loanManager;

    constructor() 
        ERC20("EggCoin", "EGG")
        ERC20Permit("EggCoin")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setProtocolContracts(address _liquidityPool, address _loanManager, address _yieldPool) public onlyRole(ADMIN_ROLE) {
        liquidityPool = _liquidityPool;
        loanManager = _loanManager;
        _grantRole(MINTER_ROLE, _liquidityPool);
        _grantRole(BURNER_ROLE, _loanManager);
        _grantRole(BURNER_ROLE, _liquidityPool);
        _grantRole(ADMIN_ROLE, _yieldPool);
        // Keep ADMIN_ROLE for deployer to allow future upgrades
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function approveForContract(address spender, uint256 amount) public onlyRole(ADMIN_ROLE) {
        _approve(address(this), spender, amount);
    }

    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }
}
