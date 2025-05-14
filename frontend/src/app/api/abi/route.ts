import { NextResponse } from 'next/server'
import { ethers } from 'ethers'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const contract = searchParams.get('contract')

  if (!contract) {
    return NextResponse.json(
      { error: 'contract parameter is required' },
      { status: 400 }
    )
  }

  try {
    // Get backend path relative to frontend (from src/app/api/abi)
    const backendPath = path.join(process.cwd(), '..', '..', '..', '..', 'backend')
    const contractPath = path.join(
      backendPath,
      'artifacts',
      'contracts',
      `${contract}.sol`,
      `${contract}.json`
    )
    console.log('Looking for contract at:', contractPath)

    // Verify file exists first
    try {
      await fs.access(contractPath)
    } catch (err) {
      console.error('Contract file not found:', contractPath)
      throw new Error(`Contract ${contract} not found at ${contractPath}`)
    }

    // Read file asynchronously
    const fileContents = await fs.readFile(contractPath, 'utf-8')
    console.log('Successfully loaded contract:', contract)
    const contractArtifact = JSON.parse(fileContents);
    
    if (!contractArtifact?.abi) {
      throw new Error(`No ABI found in contract artifact`);
    }

    return NextResponse.json({
      success: true,
      abi: contractArtifact.abi,
      contractName: contract
    });
  } catch (error) {
    console.error(`Error loading ABI for ${contract}:`, error)
    return NextResponse.json(
      { error: `Failed to load contract ABI for ${contract}` },
      { status: 500 }
    )
  }
}
