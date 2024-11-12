'use client';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { NextPage } from 'next/types';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import BalanceDisplay from '@/components/BalanceDisplay';

const Page: NextPage = () => {
  const endpoint = clusterApiUrl('devnet');
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <WalletMultiButton />
            <BalanceDisplay />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default Page;
