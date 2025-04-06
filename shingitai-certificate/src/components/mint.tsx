import { useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Address, getAddress } from 'viem';
import { wagmiContract } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Mint = () => {
  const [mintReceiver, setMintReceiver] = useState<string>('');
  const [tokenId, setTokenId] = useState<number>(0);
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const handleReceiver = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMintReceiver(getAddress(value));
  };

  const handleTokenIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTokenId(Number(value));
  };

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleMint = async () => {
    console.log(`mintReceiver: ${mintReceiver}`);
    console.log(`tokenId: ${tokenId}`);
    writeContract({
      ...wagmiContract,
      functionName: 'mint',
      args: [mintReceiver as Address, tokenId],
    });
  };
  return (
    <div>
      {hash && <div>Transaction Hash: {hash}</div>}
      {error && <div>Error: {error.message}</div>}
      {isLoading && <div>Waiting for confirmation...</div>}
      {isSuccess && <div>Successfully confirmed</div>}
      <Input
        type="string"
        placeholder="Enter the recipient address"
        value={mintReceiver}
        onChange={handleReceiver}
      />
      <Input
        type="number"
        placeholder="Enter the token ID"
        value={tokenId}
        onChange={handleTokenIdChange}
      />
      <Button onClick={handleMint} disabled={isPending}>
        Mint
      </Button>
    </div>
  );
};
