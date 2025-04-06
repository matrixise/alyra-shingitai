import { useNFTMetadata } from '@/hooks/useNFTMetadata';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Grade } from '@/lib/graphql-queries';

type CardCertificateProps = {
  grade: Grade;
};

type AttributeProps = {
  trait_type: string;
  value: string;
};

export const CardCertificate = ({ grade }: CardCertificateProps) => {
  const {
    data: nftMetadata,
    imageUrl,
    error,
    isLoading,
  } = useNFTMetadata(grade.tokenURI);

  if (isLoading) return <div>Loading the NFT...</div>;
  if (error) return <div>Error fetching the NFT...</div>;

  // Extract Grade and Date from attributes
  const gradeAttribute: AttributeProps = nftMetadata?.attributes?.find(
    (attr: AttributeProps) => attr.trait_type === 'grade',
  );
  const dateAttribute: AttributeProps = nftMetadata?.attributes?.find(
    (attr: AttributeProps) => attr.trait_type === 'date',
  );

  const gradeValue: string = gradeAttribute?.value ?? 'Unknown';
  const dateValue: string = dateAttribute?.value ?? 'Unknown';

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{nftMetadata?.name || 'Card Title'}</CardTitle>
        <CardDescription>
          {nftMetadata?.description || 'Card Description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-[350px]">
          <Image
            src={imageUrl}
            alt={nftMetadata?.name || 'NFT Image'}
            fill={false}
            width={100}
            height={100}
          />
        </div>
      </CardContent>
      <CardFooter>
        <span>
          {gradeValue} - {dateValue}
        </span>
      </CardFooter>
    </Card>
  );
};
