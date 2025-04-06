import { useGrades } from '@/hooks/useGrades';

export const ListGrades = () => {
  const { listGrades, error, isLoading } = useGrades();

  return (
    <div>
      {error && <div>Error: Impossible de lire la liste des grades</div>}
      {isLoading && <div>Loading...</div>}
      <h2>List Grades</h2>
      {listGrades && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Points</th>
              <th>TokenId</th>
            </tr>
          </thead>
          <tbody>
            {listGrades.map((grade, index) => (
              <tr key={index}>
                <td>{grade.name}</td>
                <td>{grade.points}</td>
                <td>{grade.tokenId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
