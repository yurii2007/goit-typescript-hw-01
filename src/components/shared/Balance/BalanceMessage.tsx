import { FC } from 'react';

const BalanceMessage: FC<{ balance: number }> = ({ balance }) => {
  return <h3>Balance: {balance.toFixed(6)}SOL</h3>;
};

export default BalanceMessage;
