const { ethers } = require("hardhat");
const { getNetworkConfig, saveNetworkConfig, generateFrontendEnv } = require("../config/utils");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'localhost' : network.name;
  
  console.log(`Deploying contracts to ${networkName} with account:`, deployer.address);

  // Load network config
  const config = getNetworkConfig(networkName);

  // 1. Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  config.contracts.MockUSDC = mockUSDC.target;
  console.log("MockUSDC deployed to:", mockUSDC.target);

  // 2. Deploy EggCoin
  const EggCoin = await ethers.getContractFactory("EggCoin");
  const eggCoin = await EggCoin.deploy();
  config.contracts.EggCoin = eggCoin.target;
  console.log("EggCoin deployed to:", eggCoin.target);

  // 3. Deploy LiquidityPool
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(
    config.contracts.MockUSDC,
    config.contracts.EggCoin,
    deployer.address, // developer
    deployer.address, // farmer
    deployer.address, // investor
    deployer.address  // vendor
  );
  config.contracts.LiquidityPool = liquidityPool.target;
  console.log("LiquidityPool deployed to:", liquidityPool.target);

  // 4. Deploy LoanManager (temporary with zero address)
  const LoanManager = await ethers.getContractFactory("LoanManager");
  const loanManager = await LoanManager.deploy(
    config.contracts.EggCoin,
    ethers.ZeroAddress, // Temporary zero address for yieldPool
    deployer.address    // Developer address
  );
  config.contracts.LoanManager = loanManager.target;
  console.log("LoanManager deployed to:", loanManager.target);

  // 5. Deploy YieldPool
  const YieldPool = await ethers.getContractFactory("YieldPool");
  const yieldPool = await YieldPool.deploy(
    config.contracts.EggCoin,
    config.contracts.LiquidityPool,
    config.contracts.LoanManager
  );
  config.contracts.YieldPool = yieldPool.target;
  console.log("YieldPool deployed to:", yieldPool.target);

  // 6. Update LoanManager with YieldPool address
  await loanManager.setYieldPool(config.contracts.YieldPool);
  console.log("LoanManager updated with YieldPool");

  // 7. Setup protocol contracts
  await eggCoin.setProtocolContracts(
    config.contracts.LiquidityPool,
    config.contracts.LoanManager,
    config.contracts.YieldPool
  );
  await loanManager.setLiquidityPool(config.contracts.LiquidityPool);
  console.log("Protocol contracts configured");

  // Save updated config
  saveNetworkConfig(networkName, config);

  // Generate frontend env file
  const envContent = generateFrontendEnv(networkName, config);
  const envPath = path.join(__dirname, '../../frontend/.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log("\nDeployment complete!");
  console.log("\nContract Addresses:");
  console.log("MockUSDC:", config.contracts.MockUSDC);
  console.log("EggCoin:", config.contracts.EggCoin);
  console.log("LiquidityPool:", config.contracts.LiquidityPool);
  console.log("LoanManager:", config.contracts.LoanManager);
  console.log("YieldPool:", config.contracts.YieldPool);
  console.log(`\nFrontend .env file updated at: ${envPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
