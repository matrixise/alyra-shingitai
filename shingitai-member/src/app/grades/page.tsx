'use client';
import { useQuery } from '@apollo/client';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { Suspense } from 'react';
import { GET_GRADES_BY_ADDRESS, Grade } from '@/lib/graphql-queries';
import { CardCertificate } from '@/components/CardCertificate';

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

const ParticipantDisplayWidget = () => {
  const { address, isConnected } = useAccount();
  if (!isConnected) return <div>Not connected</div>;

  return (
    <Suspense fallback={<div>Loading</div>}>
      <ParticipantDisplayContent address={address!} />
    </Suspense>
  );
};

const GradesPage = () => {
  return <ParticipantDisplayWidget />;
};

export default GradesPage;
