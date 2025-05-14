declare module '@/config/wallet' {
  import { Chain } from 'viem/chains';
  import { ContractConfig } from '@/utils/contractLoader';

  export const CONTRACTS: {
    [key: string]: Record<number, { address: ContractConfig['address'] }>;
  };
}
