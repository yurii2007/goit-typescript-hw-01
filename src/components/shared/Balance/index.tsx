import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import BalanceMessage from './BalanceMessage';

const Balance = () => {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!connection || !publicKey) {
      setBalance(0);
      return;
    }

    (async () => {
      try {
        const balance = await connection.getBalance(publicKey, {});
        setBalance(balance);
      } catch (error) {
        console.error(error);
        setBalance(NaN);
      }
    })();
  }, [connection, publicKey]);

  if (!connection) {
    return <h2>No wallet detected, please connect wallet first</h2>;
  }

  return isNaN(balance) ? (
    <ErrorMessage />
  ) : (
    <BalanceMessage balance={balance} />
  );
};

export default Balance;
