import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC, useState } from 'react';
import styles from '../styles/Home.module.css';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptAccount,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';

export const CreateMintForm: FC = () => {
  const [txSig, setTxSig] = useState('');
  const [mint, setMint] = useState('');

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const link = () => {
    return txSig
      ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet`
      : '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!connection || !publicKey) {
      return;
    }

    const mint = Keypair.generate();

    const lamports = await getMinimumBalanceForRentExemptAccount(connection);

    const transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mint.publicKey,
        lamports,
        programId: TOKEN_PROGRAM_ID,
        space: MINT_SIZE,
      }),
      createInitializeMintInstruction(
        mint.publicKey,
        2,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendTransaction(transaction, connection);
    setTxSig(signature);
    setMint(mint.publicKey.toString());
  };

  return (
    <div>
      {publicKey ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <button type="submit" className={styles.formButton}>
            Create Mint
          </button>
        </form>
      ) : (
        <span>Connect Your Wallet</span>
      )}
      {txSig ? (
        <div>
          <p>Token Mint Address: {mint}</p>
          <p>View your transaction on </p>
          <a href={link()}>Solana Explorer</a>
        </div>
      ) : null}
    </div>
  );
};
