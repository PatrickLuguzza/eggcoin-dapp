const { getContractInstance } = require('./getAbi');
const { BASESCAN_API_KEY } = require('../config/networks/baseMainnet.json');

// Helper function to get all deployed contract instances
async function getAllContracts() {
  const contracts = {};

  contracts.MockUSDC = await getContractInstance('0x76CBb757d25ee75876B894079463D5973e9d593B');
  contracts.EggCoin = await getContractInstance('0xCd22e18D0605a6843Fd74F11D02b7622D5Dfe251');
  contracts.LiquidityPool = await getContractInstance('0x1A7879934f5106Cef3FDc0eF432A565911f10378');
  contracts.LoanManager = await getContractInstance('0x653bb152d1B3fF6641f5f50F021686CCf1D8F80e');
  contracts.YieldPool = await getContractInstance('0xB0b0768B68189aF86d93C150881002a21b35dB20');

  return contracts;
}

module.exports = {
  getAllContracts
};
