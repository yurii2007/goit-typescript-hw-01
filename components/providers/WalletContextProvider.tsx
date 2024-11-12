import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { FC, ReactNode } from 'react';

export const WalletContextProvider: FC<{ chidlren: ReactNode }> = ({
  children,
}) => {
  return (
    <ConnectionProvider endpoint="">
      <WalletProvider wallets={[]}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
