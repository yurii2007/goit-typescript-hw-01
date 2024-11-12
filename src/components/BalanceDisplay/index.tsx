'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

const BalanceDisplay: FC = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) return;

    (async () => {
      try {
        connection.onAccountChange(
          publicKey,
          (accountInfo) => setBalance(accountInfo.lamports / LAMPORTS_PER_SOL),
          'confirmed'
        );

        const accountInfo = await connection.getAccountInfo(publicKey);

        if (!accountInfo) {
          return;
        } else {
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [connection, publicKey]);

  return <div>{publicKey && <p>Balance: {balance}</p>}</div>;
};

export default BalanceDisplay;
