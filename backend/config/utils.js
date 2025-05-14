const fs = require('fs');
const path = require('path');

function getNetworkConfig(networkName) {
  const configPath = path.join(__dirname, 'networks', `${networkName}.json`);
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveNetworkConfig(networkName, config) {
  const configPath = path.join(__dirname, 'networks', `${networkName}.json`);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function generateFrontendEnv(networkName, config) {
  let envContent = '';
  for (const [contract, address] of Object.entries(config.contracts)) {
    envContent += `NEXT_PUBLIC_${contract.toUpperCase()}_ADDRESS=${address}\n`;
  }
  return envContent;
}

module.exports = {
  getNetworkConfig,
  saveNetworkConfig,
  generateFrontendEnv
};
