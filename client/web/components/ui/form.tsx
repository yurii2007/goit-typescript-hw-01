import { FC, FormEvent, useState } from 'react';
import { StudentIntro } from '@/models/studentIntro';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const STUDENT_INTRO_PROGRAM_ID = 'HdE95RSVsdb315jfJtaykXhXY478h53X6okDupVfY9yf';

export const Form: FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const studentIntro = new StudentIntro(name, message);
    handleTransactionSubmit(studentIntro);
  };

  const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
    try {
      console.log(studentIntro);
      if (!publicKey) {
        toast.error('Connect your wallet first');
        return;
      }

      const buffer = studentIntro.serialize();
      const transaction = new Transaction();

      const [pda] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), new TextEncoder().encode(studentIntro.name)],
        new PublicKey(STUDENT_INTRO_PROGRAM_ID)
      );

      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: publicKey,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: pda,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: new PublicKey(STUDENT_INTRO_PROGRAM_ID),
        data: buffer,
      });

      transaction.add(instruction);

      const recentBlockhash = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = recentBlockhash.blockhash;

      const transactionId = await sendTransaction(transaction, connection, {
        skipPreflight: true,
      });
      console.log(transactionId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="py-4 px-6 max-w-[450px] flex items-center justify-center flex-col border border-gray-700 rounded-lg bg-gray-800 text-white"
    >
      <div className="mb-4">
        <label className="block text-gray-400 mb-2" htmlFor="title">
          What do we call you?
        </label>
        <input
          id="name"
          className="p-2 w-[400px] bg-gray-700 border border-gray-600 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-400 mb-2" htmlFor="review">
          What brings you to Solana, friend?
        </label>
        <textarea
          id="message"
          className="w-[400px] p-2 bg-gray-700 border border-gray-600 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-[400px] p-2 bg-green-600 hover:bg-green-700 rounded"
      >
        Submit Review
      </button>
    </form>
  );
};
