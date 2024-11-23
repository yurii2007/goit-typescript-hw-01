import { FC, useState, useEffect, useDeferredValue } from 'react';
import { Card } from './card';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { StudentIntro } from '@/models/studentIntro';
import { StudentIntroCoordinator } from '@/coordinator/student-intro-coordinator';

const STUDENTS_PER_PAGE = 10;

export const StudentList: FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(clusterApiUrl('devnet'));
  const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        const studentIntros = await StudentIntroCoordinator.fetchAccounts(
          connection,
          page,
          STUDENTS_PER_PAGE,
          deferredSearch,
          deferredSearch !== ''
        );
        setStudentIntros(studentIntros);
      } catch (error) {
        console.error('Failed to fetch student intros:', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, deferredSearch]);

  return (
    <div className="py-5 flex flex-col w-full items-center justify-center">
      <input
        id="search"
        className="w-[300px] p-2 mb-4 bg-gray-700 border border-gray-600 rounded text-gray-400"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
      />
      {studentIntros.map((studentIntro, i) => (
        <Card key={i} studentIntro={studentIntro} />
      ))}
      <div className="flex justify-between mt-4 w-full">
        {page > 0 && (
          <button
            onClick={() => setPage((page) => page - 1)}
            className="px-6 py-2 bg-gray-300 text-black font-semibold rounded"
          >
            Previous
          </button>
        )}
        {studentIntros.length !== 0 &&
          studentIntros.length % STUDENTS_PER_PAGE === 0 && (
            <button
              onClick={() => setPage((page) => page + 1)}
              className="px-6 py-2 bg-gray-300 text-black font-semibold rounded"
            >
              Next
            </button>
          )}
      </div>
    </div>
  );
};
