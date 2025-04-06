import useSWR from 'swr';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

const PINATA_IPFS_URI = process.env.NEXT_PUBLIC_PINATA_IPFS_URI;

export const useNFTMetadata = (tokenURI: string) => {
  const httpUri = tokenURI.replace('ipfs://', PINATA_IPFS_URI!);
  const { data, error, isLoading } = useSWR(httpUri, fetcher);

  const imageUrl = data?.image
    ? data.image.replace('ipfs://', PINATA_IPFS_URI)
    : '';

  return {
    data,
    imageUrl,
    error,
    isLoading,
  };
};
