const { ethers } = require("hardhat");

async function main() {
  // Get contract factories
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const EggCoin = await ethers.getContractFactory("EggCoin");
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const LoanManager = await ethers.getContractFactory("LoanManager");
  const YieldPool = await ethers.getContractFactory("YieldPool");

  // Get signers
  const [deployer, investor, farmer, vendor] = await ethers.getSigners();

  // Deploy base contracts
  const mockUSDC = await MockUSDC.connect(deployer).deploy();
  const eggCoin = await EggCoin.connect(deployer).deploy();

  // Deploy contracts in proper sequence with role synchronization
  const loanManager = await LoanManager.connect(deployer).deploy(
    eggCoin.target,
    ethers.ZeroAddress,
    deployer.address
  );
  
  const liquidityPool = await LiquidityPool.connect(deployer).deploy(
    mockUSDC.target,
    eggCoin.target,
    deployer.address, // developer
    farmer.address,
    investor.address,
    vendor.address
  );

  const yieldPool = await YieldPool.connect(deployer).deploy(
    eggCoin.target,
    liquidityPool.target,
    loanManager.target
  );

  // Verify role assignments
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const DEVELOPER_ROLE_HASH = await liquidityPool.DEVELOPER_ROLE();
  
  console.log("\nRole Verification:");
  console.log("- DEFAULT_ADMIN_ROLE:", await liquidityPool.hasRole(DEFAULT_ADMIN_ROLE, deployer.address));
  console.log("- DEVELOPER_ROLE:", await liquidityPool.hasRole(DEVELOPER_ROLE_HASH, deployer.address));
  
  // Grant any missing roles
  if (!await liquidityPool.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)) {
    console.log("Granting DEFAULT_ADMIN_ROLE...");
    await liquidityPool.connect(deployer).grantRole(DEFAULT_ADMIN_ROLE, deployer.address);
  }
  if (!await liquidityPool.hasRole(DEVELOPER_ROLE_HASH, deployer.address)) {
    console.log("Granting DEVELOPER_ROLE...");
    await liquidityPool.connect(deployer).grantRole(DEVELOPER_ROLE_HASH, deployer.address);
  }

  console.log("Deployer address:", deployer.address);
  console.log("LiquidityPool roles:");
  console.log("- Developer:", await liquidityPool.hasRole(await liquidityPool.DEVELOPER_ROLE(), deployer.address));
  console.log("- Farmer:", await liquidityPool.hasRole(await liquidityPool.FARMER_ROLE(), farmer.address));
  console.log("- Investor:", await liquidityPool.hasRole(await liquidityPool.INVESTOR_ROLE(), investor.address));
  console.log("- Vendor:", await liquidityPool.hasRole(await liquidityPool.VENDOR_ROLE(), vendor.address));

  // Setup protocol (all calls made by deployer)
  console.log("\nSetting up protocol...");
  
  // First approve LoanManager while deployer still has ADMIN_ROLE
  console.log("Approving EggCoin for LoanManager...");
  await eggCoin.connect(deployer).approveForContract(
    loanManager.target, 
    ethers.MaxUint256
  );

  // Then set protocol contracts on EggCoin to establish roles
  await eggCoin.connect(deployer).setProtocolContracts(
    liquidityPool.target, 
    loanManager.target, 
    yieldPool.target
  );
  
  // Setup other contracts
  await loanManager.connect(deployer).setYieldPool(yieldPool.target);
  console.log("YieldPool set on LoanManager");
  await loanManager.connect(deployer).setLiquidityPool(liquidityPool.target);
  console.log("LiquidityPool set on LoanManager");

  // Set LoanManager on LiquidityPool with comprehensive verification
  console.log("\nFinal verification before setLoanManager:");
  
  // 1. Verify signer consistency
  const currentSigner = (await ethers.provider.getSigner()).address;
  console.log("- Expected deployer:", deployer.address);
  console.log("- Current signer:", currentSigner);
  
  if (currentSigner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`Signer mismatch! Expected ${deployer.address} but got ${currentSigner}`);
  }

  // 2. Verify role hash matches across contracts
  const loanManagerDevRole = await loanManager.DEVELOPER_ROLE();
  const liquidityPoolDevRole = await liquidityPool.DEVELOPER_ROLE();
  console.log("- LoanManager DEVELOPER_ROLE:", loanManagerDevRole);
  console.log("- LiquidityPool DEVELOPER_ROLE:", liquidityPoolDevRole);
  
  if (loanManagerDevRole !== liquidityPoolDevRole) {
    throw new Error("DEVELOPER_ROLE mismatch between contracts!");
  }

  // 3. Explicitly grant role if needed
  if (!await liquidityPool.hasRole(liquidityPoolDevRole, deployer.address)) {
    console.log("Granting DEVELOPER_ROLE to deployer...");
    await liquidityPool.connect(deployer).grantRole(liquidityPoolDevRole, deployer.address);
  }

  // 4. Execute with fresh signer verification
  console.log("- Final DEVELOPER_ROLE verification:", 
    await liquidityPool.hasRole(liquidityPoolDevRole, deployer.address));

  // Get fresh signer instance
  const [freshDeployer] = await ethers.getSigners();
  console.log("- Fresh deployer address:", freshDeployer.address);
  
  if (freshDeployer.address.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(`Signer mismatch! Expected ${deployer.address} but got ${freshDeployer.address}`);
  }

  // Get fresh contract instance with explicit signer and ABI
  const verifiedLiquidityPool = await ethers.getContractAt(
    "LiquidityPool", 
    liquidityPool.target,
    freshDeployer
  );

  // Grant LiquidityPool contract the DEVELOPER_ROLE
  console.log("Granting DEVELOPER_ROLE to LiquidityPool contract...");
  await verifiedLiquidityPool.grantRole(
    await verifiedLiquidityPool.DEVELOPER_ROLE(),
    verifiedLiquidityPool.target
  );

  console.log("=== Final Verification ===");
  console.log("Contract address:", verifiedLiquidityPool.target);
  console.log("Signer address:", await verifiedLiquidityPool.runner.address);
  console.log("LiquidityPool has DEVELOPER_ROLE:", 
    await verifiedLiquidityPool.hasRole(
      await verifiedLiquidityPool.DEVELOPER_ROLE(),
      verifiedLiquidityPool.target
    )
  );

  console.log("Executing setLoanManager...");
  const tx = await verifiedLiquidityPool.setLoanManager(loanManager.target);
  console.log("Transaction sent from:", await tx.from);
  
  const receipt = await tx.wait();
  console.log("=== Transaction Confirmed ===");
  console.log("Block:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log("Transaction sent from:", await tx.from);
  await tx.wait();
  console.log("LoanManager set on LiquidityPool - Tx Hash:", tx.hash);

  // Simulate flow
  console.log("\n=== Starting Simulation ===");

  // 1. Investor deposits 1000 USDC
  console.log("\n1. Investor deposits 1000 USDC");
  await mockUSDC.mint(investor.address, 1000);
  await mockUSDC.connect(investor).approve(liquidityPool.target, 1000);
  await liquidityPool.connect(investor).depositUSDC(1000);
  console.log("Investor USDC deposited, received 1000 EGG");

  // 2. Farmer borrows 100 EGG
  console.log("\n2. Farmer borrows 100 EGG");
  await loanManager.connect(farmer).requestLoan(100);
  console.log("Farmer received 100 EGG loan");

  // 3. Farmer repays loan with 5% interest (105 EGG total)
  console.log("\n3. Farmer repays loan with 5% interest");
  await eggCoin.connect(farmer).approve(loanManager.target, 105);
  await loanManager.connect(farmer).repayLoan(0);
  console.log("Loan repaid with 5 EGG interest sent to YieldPool");

  // 4. Investor claims yield
  console.log("\n4. Investor claims yield");
  await yieldPool.connect(investor).claimYield();
  console.log("Investor claimed yield from the pool");

  console.log("\n=== Simulation Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
