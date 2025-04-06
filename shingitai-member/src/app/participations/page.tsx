'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@apollo/client';
import React from 'react';
import {
  GET_PARTICIPATIONS_BY_ADDRESS,
  Participation,
} from '@/lib/graphql-queries';
import { CardParticipation } from '@/components/CardParticipation';

const Participations = () => {
  const { address, isConnected } = useAccount();
  const { loading, error, data } = useQuery(GET_PARTICIPATIONS_BY_ADDRESS, {
    variables: { receiver: address },
  });
  if (!isConnected) return <div>Not connected</div>;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Oh no... {error.message}</div>;

  return (
    <>
      <div>
        Participation Count: {data?.participations?.totalCount.toString()}
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-4">
        {data?.participations?.items?.map(
          (participation: Participation, index: number) => (
            <CardParticipation key={index} participation={participation} />
          ),
        )}
      </div>
    </>
  );
};

const ParticipationsPage = () => {
  return <Participations />;
};

export default ParticipationsPage;
