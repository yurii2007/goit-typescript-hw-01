import { useWallet } from '@solana/wallet-adapter-react';
import SendForm from './SendForm';

const SendSOLForm = () => {
  const { publicKey, connected } = useWallet();

  if (!publicKey || !connected) return null;
  return <SendForm />;
};

export default SendSOLForm;
