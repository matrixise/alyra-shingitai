'use client';
import { useParams } from 'next/navigation';
import { Address, isAddress } from 'viem';
import { CardCertificate } from '@/components/CardCertificate';
import { useQuery } from '@apollo/client';
import { GET_GRADES_BY_ADDRESS, Grade } from '@/lib/graphql-queries';

const ParticipantDisplayContent = ({ address }: { address: Address }) => {
  const { loading, error, data } = useQuery(GET_GRADES_BY_ADDRESS, {
    variables: { receiver_address: address },
  });
  if (loading) return null;
  if (error) return <div>Error! {error.message}</div>;
  return (
    <>
      <div>Grade Count: {data.gradeAssignations.totalCount.toString()}</div>
      {data?.gradeAssignations?.items.map((grade: Grade, index: number) => (
        <CardCertificate key={index} grade={grade} />
      ))}
    </>
  );
};

const CertificatePage = () => {
  const params = useParams<{ address: Address }>();
  if (!isAddress(params.address))
    return <div>This is not an address of a wallet</div>;
  return (
    <>
      <h1>Certificates</h1>
      <p>Address: {params.address}</p>
      <ParticipantDisplayContent address={params.address} />
    </>
  );
};

export default CertificatePage;
