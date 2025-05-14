const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EggCoin Protocol", function () {
  let deployer, investor, farmer;
  let mockUSDC, eggCoin, liquidityPool, loanManager, yieldPool;

  before(async function () {
    [deployer, investor, farmer] = await ethers.getSigners();

    // Deploy all contracts
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    
    const EggCoin = await ethers.getContractFactory("EggCoin");
    eggCoin = await EggCoin.deploy();
    
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy(mockUSDC.target, eggCoin.target);
    
    const LoanManager = await ethers.getContractFactory("LoanManager");
    loanManager = await LoanManager.deploy(eggCoin.target, ethers.ZeroAddress); // Temp yieldPool address
    
    const YieldPool = await ethers.getContractFactory("YieldPool");
    yieldPool = await YieldPool.deploy(eggCoin.target, liquidityPool.target, loanManager.target);
    
    // Update loanManager with real yieldPool address
    await loanManager.setYieldPool(yieldPool.target);

    // Setup protocol
    await eggCoin.setProtocolContracts(liquidityPool.target, loanManager.target, yieldPool.target);
    await loanManager.setLiquidityPool(liquidityPool.target);

    // Fund investor with USDC
    await mockUSDC.mint(investor.address, ethers.parseEther("1000"));
  });

  it("should allow investor to deposit USDC and receive EggCoin", async function () {
    // Approve USDC transfer
    await mockUSDC.connect(investor).approve(liquidityPool.target, ethers.parseEther("100"));
    
    // Deposit USDC
    await liquidityPool.connect(investor).depositUSDC(ethers.parseEther("100"));
    
    // Check balances
    expect(await eggCoin.balanceOf(investor.address)).to.equal(ethers.parseEther("100"));
    expect(await mockUSDC.balanceOf(liquidityPool.target)).to.equal(ethers.parseEther("100"));
  });

  it("should allow farmer to request and repay loan", async function () {
    // Register farmer
    await loanManager.registerFarmer(farmer.address, 75);
    
    // Log egg production (7 days required)
    for (let i = 0; i < 7; i++) {
      await loanManager.logEggProduction(farmer.address, 100);
    }
    
    // Request loan
    await loanManager.connect(farmer).requestLoan(ethers.parseEther("50"), "Farm equipment");
    
    // Check loan created
    const loan = await loanManager.loans(0);
    expect(loan.farmer).to.equal(farmer.address);
    expect(loan.amount).to.equal(ethers.parseEther("50"));
    
    // Repay loan
    await eggCoin.connect(farmer).approve(loanManager.target, ethers.parseEther("52.5")); // 50 + 5% interest
    await loanManager.connect(farmer).repayLoan(0);
    
    // Check loan repaid
    expect((await loanManager.loans(0)).isRepaid).to.be.true;
  });

  it("should demonstrate complete protocol flow", async function () {
    // 1. Investor deposits 100 USDC
    await mockUSDC.connect(investor).approve(liquidityPool.target, ethers.parseEther("100"));
    await liquidityPool.connect(investor).depositUSDC(ethers.parseEther("100"));
    expect(await eggCoin.balanceOf(investor.address)).to.equal(ethers.parseEther("100"));

    // 2. Farmer registers and logs egg production
    await loanManager.registerFarmer(farmer.address, 75);
    for (let i = 0; i < 7; i++) {
      await loanManager.logEggProduction(farmer.address, 100);
    }

    // 3. Farmer takes 50 EGG loan
    await loanManager.connect(farmer).requestLoan(ethers.parseEther("50"), "Farm equipment");
    expect(await eggCoin.balanceOf(farmer.address)).to.equal(ethers.parseEther("50"));

    // 4. Farmer repays loan with 5% interest
    await eggCoin.connect(farmer).approve(loanManager.target, ethers.parseEther("52.5"));
    await loanManager.connect(farmer).repayLoan(0);
    expect(await eggCoin.balanceOf(farmer.address)).to.equal(0);

    // 5. Investor claims yield
    const initialBalance = await eggCoin.balanceOf(investor.address);
    await yieldPool.connect(investor).claimYield();
    const newBalance = await eggCoin.balanceOf(investor.address);
    
    // Should have original 100 EGG + interest
    expect(newBalance).to.be.gt(initialBalance);
    console.log(`Investor yield: ${ethers.formatEther(newBalance - initialBalance)} EGG`);
  });
});
