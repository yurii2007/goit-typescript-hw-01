import { FC, useState, useEffect } from 'react';
import { Card } from './card';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { StudentIntro } from '@/models/studentIntro';
import { STUDENT_INTRO_PROGRAM_ID } from './form';

export const StudentList: FC = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const connection = new Connection(clusterApiUrl('devnet'));
  const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([]);

  useEffect(() => {
    const fetchStudentIntros = async () => {
      try {
        const accounts = await connection.getProgramAccounts(
          new PublicKey(STUDENT_INTRO_PROGRAM_ID)
        );
        const studentIntros: StudentIntro[] = accounts.reduce(
          (accumulator: StudentIntro[], { account }) => {
            try {
              const studentIntro = StudentIntro.deserialize(account.data);
              if (studentIntro) {
                return accumulator.concat(studentIntro);
              } else {
                throw new Error('Deserialization error');
              }
            } catch (error) {
              console.error('Error deserializing student intro:', error);
              return accumulator;
            }
          },
          []
        );
        setStudentIntros(studentIntros);
      } catch (error) {
        console.error('Failed to fetch student intros:', error);
      }
    };

    fetchStudentIntros();
  }, [connection]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      {studentIntros.map((studentIntro, i) => (
        <Card key={i} studentIntro={studentIntro} />
      ))}
    </div>
  );
};
