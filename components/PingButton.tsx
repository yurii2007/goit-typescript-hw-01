'use client';

import { FC } from 'react';
import styles from '../styles/PingButton.module.css';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const PROGRAM_ID = 'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa';
const PROGRAM_DATA_ID = 'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod';

export const PingButton: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const onClick = async () => {
    if (!connection || !publicKey) {
      return;
    }

    try {
      const programId = new PublicKey(PROGRAM_ID);
      const programDataAccount = new PublicKey(PROGRAM_DATA_ID);
      const transaction = new Transaction();

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: programDataAccount, isSigner: false, isWritable: true },
        ],
        programId,
      });

      transaction.add(instruction);

      const signature = await sendTransaction(transaction, connection, {
        maxRetries: 5,
        skipPreflight: true,
      });
      console.log(signature);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.buttonContainer} onClick={onClick}>
      <button className={styles.button}>Ping!</button>
    </div>
  );
};
