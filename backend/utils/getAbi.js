const axios = require('axios');
const { ethers } = require('ethers');

const BASE_MAINNET_RPC_URL = process.env.BASE_MAINNET_RPC_URL;
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY;

async function getContractAbi(contractAddress) {
  try {
    const url = `https://api.basescan.org/api?module=contract&action=getabi&address=${contractAddress}&apikey=${BASESCAN_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status !== '1') {
      throw new Error(`BaseScan API error: ${response.data.message}`);
    }

    return JSON.parse(response.data.result);
  } catch (error) {
    console.error('Error fetching ABI:', error.message);
    throw error;
  }
}

async function getContractInstance(contractAddress) {
  try {
    const abi = await getContractAbi(contractAddress);
    const provider = new ethers.providers.JsonRpcProvider(BASE_MAINNET_RPC_URL);
    return new ethers.Contract(contractAddress, abi, provider);
  } catch (error) {
    console.error('Error creating contract instance:', error.message);
    throw error;
  }
}

module.exports = {
  getContractAbi,
  getContractInstance
};
