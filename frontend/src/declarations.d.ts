declare module '*.json' {
  const value: {
    abi: any[];
    bytecode: string;
    deployedBytecode: string;
  };
  export default value;
}

declare module '@/utils/format' {
  export function formatTokenAmount(amount: bigint, decimals: number): string;
}
