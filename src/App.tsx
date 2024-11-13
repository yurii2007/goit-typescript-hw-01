import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SolanaWalletsProvider } from './components/Providers';
import '@solana/wallet-adapter-react-ui/styles.css';
import Balance from './components/shared/Balance';
import SendSOLForm from './components/shared/SendSOLForm';

function App() {
  return (
    <SolanaWalletsProvider>
      <WalletMultiButton />
      <Balance />

      <SendSOLForm />
    </SolanaWalletsProvider>
  );
}

export default App;
