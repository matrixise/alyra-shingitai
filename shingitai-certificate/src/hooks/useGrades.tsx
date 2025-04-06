import { useEffect, useState } from 'react';
import { useClient, useReadContract } from 'wagmi';
import { wagmiContract } from '@/lib/constants';
import { getContract } from 'viem';

type Grade = {
  name: string;
  points: number;
  tokenId: number;
};

export const useGrades = () => {
  const [listGrades, setListGrades] = useState<Grade[]>([]);
  const {
    data: nextTokenId,
    error,
    isLoading,
  } = useReadContract({
    ...wagmiContract,
    functionName: 'nextTokenId',
  });

  const client = useClient();

  useEffect(() => {
    const fetchGrades = async () => {
      const contract = getContract({
        ...wagmiContract,
        client: client!,
      });

      const gradesPromises = Array.from(
        { length: Number(nextTokenId) },
        (_, i) => contract.read.grades([i]),
      );

      type GradeTuple = readonly [string, number];
      try {
        const gradesData: GradeTuple[] = await Promise.all(gradesPromises);
        console.log(gradesData);
        const formattedGrades = gradesData.map(
          (grade: GradeTuple, index: number) => ({
            name: grade[0],
            points: Number(grade[1]),
            tokenId: index,
          }),
        );
        setListGrades(formattedGrades);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };
    if (nextTokenId !== undefined && client !== undefined) {
      fetchGrades();
    }
  }, [nextTokenId, client]);

  return {
    listGrades,
    error,
    isLoading,
  };
};
