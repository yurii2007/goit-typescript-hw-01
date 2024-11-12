'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { FC } from 'react';

const SendTransaction: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();

  const sendSol = async () => {
    if (!publicKey) return;

    try {
      const recipientPublicKey = new PublicKey(publicKey);

      const transaction = new Transaction();
      const sendSOLInstruction = SystemProgram.transfer({
        fromPubkey: recipientPublicKey,
        toPubkey: recipientPublicKey,
        lamports: 0.1 * LAMPORTS_PER_SOL,
      });

      transaction.add(sendSOLInstruction);

      const signature = await sendTransaction(transaction, connection);
      console.log('Signature: ', signature);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <button disabled={!publicKey} onClick={sendSol}>
      Send .1SOL transaction
    </button>
  );
};

export default SendTransaction;
