import { Address } from 'viem';
import { gql } from '@apollo/client';

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
