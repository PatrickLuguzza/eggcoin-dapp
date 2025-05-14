const contractAddresses = {
  localhost: {
    EggCoin: process.env.NEXT_PUBLIC_EGGCOIN_ADDRESS,
    MockUSDC: process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS, 
    StakingPool: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS
  }
};

export async function getContractInfo(contractName, network = 'localhost') {
  // Fetch ABI from API route
  const res = await fetch(`/api/abi?contract=${contractName}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) {
    let errorDetails = '';
    try {
      const errorData = await res.json();
      errorDetails = errorData.error || res.statusText;
    } catch {
      errorDetails = res.statusText;
    }
    const error = new Error(`Failed to fetch ABI for ${contractName}: ${errorDetails}`);
    error.name = 'ABIFetchError';
    error.contractName = contractName;
    error.status = res.status;
    throw error;
  }
  const abi = await res.json();
  const address = contractAddresses[network][contractName];
  
  if (!abi || !address) {
    throw new Error(`Missing ABI or address for ${contractName}`);
  }

  return {
    abi,
    address,
    contract: (providerOrSigner) => {
      return new ethers.Contract(address, abi, providerOrSigner);
    }
  };
}
