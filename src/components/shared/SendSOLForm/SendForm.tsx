import { FormEventHandler } from 'react';
import Input from '../Input';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const SendForm = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const amount = data.get('amount');
    const recipientKey = data.get('recipientKey');
    console.log({ amount, recipientKey });

    if (!amount || !recipientKey || !publicKey || !connection) {
      console.error('Missing required arguments');
      return;
    }

    try {
      const recipient = new PublicKey(recipientKey);
      const amountInLamports = +amount * LAMPORTS_PER_SOL;

      const transaction = new Transaction();
      const instruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports: amountInLamports,
      });
      console.log('before sending');

      transaction.add(instruction);

      const signature = await sendTransaction(transaction, connection);
      alert(
        `You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: 'fit-content',
      }}
    >
      <Input
        label="Amount (in SOL) to send:"
        name="amount"
        type="number"
        required
        step={0.01}
      />
      <Input
        label="Send SOL to:"
        type="text"
        defaultValue="CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN"
        required
        name="recipientKey"
      />
      <button style={{ maxWidth: '220px' }} type="submit">
        Send
      </button>
    </form>
  );
};

export default SendForm;
