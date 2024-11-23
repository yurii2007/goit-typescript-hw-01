import { FC, FormEvent, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { StudentIntro } from '@/models/studentIntro';

import { useFormTransactionToast } from './ui-layout';
import { StudentIntroCoordinator } from '@/coordinator/student-intro-coordinator';

export const Form: FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const showTransactionToast = useFormTransactionToast();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const studentIntro = new StudentIntro(name, message);
    handleTransactionSubmit(studentIntro);
  };

  const handleTransactionSubmit = async (studentIntro: StudentIntro) => {
    if (!publicKey) {
      console.log('Please connect your wallet to submit a review.');
      return;
    }

    const { result, transactionId, message } =
      await StudentIntroCoordinator.submitStudentIntro(
        connection,
        sendTransaction,
        publicKey,
        studentIntro
      );
    if (result) {
      showTransactionToast({
        signature: transactionId,
        status: 'success',
      });
      console.log(
        `Transaction submitted: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`
      );
    } else {
      showTransactionToast({
        status: 'failure',
        errorMessage: message,
      });
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
