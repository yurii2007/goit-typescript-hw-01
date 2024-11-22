import { FC, useState, useEffect } from 'react';
import { Card } from './card';
import { StudentIntro } from '@/models/studentIntro';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import toast from 'react-hot-toast';

const STUDENT_INTROS_PROGRAM_ID =
  'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf';

export const StudentList: FC = () => {
  const [studentIntros, setStudentIntros] = useState<StudentIntro[]>([]);
  const { connection } = useConnection();

  useEffect(() => {
    if (!connection) return;

    (async () => {
      try {
        const studentIntros = await connection.getProgramAccounts(
          new PublicKey(STUDENT_INTROS_PROGRAM_ID)
        );

        setStudentIntros(
          studentIntros
            .map(({ account }) => StudentIntro.deserialize(account.data))
            .filter((intro) => intro !== null)
        );
      } catch (error: any) {
        toast.error(error.message);
      }
    })();
  }, [connection, setStudentIntros]);

  return (
    <div className="py-5 flex flex-col w-fullitems-center justify-center">
      {studentIntros.map((studentIntro, i) => (
        <Card key={i} studentIntro={studentIntro} />
      ))}
    </div>
  );
};
