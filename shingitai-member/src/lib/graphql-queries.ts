import { gql } from '@apollo/client';
import { Address } from 'viem';

export const GET_GRADES_BY_ADDRESS = gql`
  query GetGradesByAddress($receiver_address: String!) {
    gradeAssignations(where: { receiver: $receiver_address }) {
      totalCount
      items {
        date
        receiver
        emitter
        gradeId
        tokenId
        tokenURI
      }
    }
  }
`;

export type Grade = {
  date: bigint;
  receiver: Address;
  emitter: Address;
  gradeId: bigint;
  tokenId: bigint;
  tokenURI: string;
};

export const GET_PARTICIPATIONS_BY_ADDRESS = gql`
  query GetParticipationsByAddress($receiver: String!) {
    participations(where: { receiver: $receiver }) {
      totalCount
      items {
        emitter
        points
        transaction
        timestamp
        event {
          eventId
          name
          date
        }
      }
    }
  }
`;
export type Participation = {
  emitter: string;
  points: number;
  receiver: string;
  transaction: Address;
  timestamp: bigint;
  event: {
    eventId: string;
    name: string;
    date: number;
  };
};
