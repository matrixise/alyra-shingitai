import { Participation } from '@/lib/graphql-queries';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import { AddressDisplay } from '@/components/AddressDisplay';
import React from 'react';

// const PINATA_IPFS_URI = "https://blue-decisive-scorpion-371.mypinata.cloud/ipfs/";

// const useNFTMetadata = (tokenURI: string) => {
//     const httpUri = tokenURI.replace("ipfs://", PINATA_IPFS_URI)
//     const {data, error, isLoading} = useSWR(httpUri, fetcher);
//
//     const imageUrl = data?.image ? data.image.replace("ipfs://", PINATA_IPFS_URI) : '';
//
//     return {
//         data, imageUrl, error, isLoading
//     }
// }

export const CardParticipation = ({
  participation,
}: {
  participation: Participation;
}) => {
  // const { data: nftMetadata, imageUrl, error: metadataError, isLoading: metadataLoading } = useNFTMetadata(uriSuccess ? tokenURI : "");
  // const { data: tokenURI, error, isLoading } = useReadContract({
  //     address: getAddress("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"),
  //     abi: participationSftAbi,
  //     functionName: "uri",
  //     args: [BigInt(parseInt(participation.event.eventId))],
  // });

  // if (isLoading) return <div>Is Loading</div>;
  // if (error) return <div>Error: {error.message}</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{participation.event.name}</CardTitle>
        <CardDescription>
          {formatDate(participation.event.date)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-[350px]">
          <Image
            src="https://blue-decisive-scorpion-371.mypinata.cloud/ipfs/bafybeighbjslyrr2rqpntowwao7mwno3xqcgdifzxsqwctqyou4jwm7aey/shingitai-training.png"
            alt="Missing image for the Event"
            fill={false}
            width={100}
            height={100}
          />
        </div>
      </CardContent>
      <CardFooter>
        <span>
          <AddressDisplay address={participation.emitter} /> -{' '}
        </span>
        <span className="text-red-400">
          {formatDate(participation.event.date)}
        </span>
      </CardFooter>
    </Card>
  );
};
