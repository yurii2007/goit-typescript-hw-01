'use client';

import { getCounterProgram, getCounterProgramId } from '@anchor-ping/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useCluster } from '../cluster/cluster-data-access';
import { useTransactionToast } from '../ui/ui-layout';
import { useAnchorProvider } from '../solana/solana-provider';
import toast from 'react-hot-toast';

export function useCounterProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();

  const provider = useAnchorProvider();
  const program = getCounterProgram(provider);
  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  });

  const initialize = useMutation({
    mutationKey: ['counter', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) => {
      return program.methods
        .initialize()
        .accounts({ counter: keypair.publicKey })
        .signers([keypair])
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
  });

  const programId = useMemo(
    () => getCounterProgramId(cluster.network as Cluster),
    [cluster]
  );

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return {
    programId,
    getProgramAccount,
    program,
    accounts,
    initialize,
  };
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();

  const { program } = useCounterProgram();

  const incrementMutation = useMutation({
    mutationKey: ['counter', 'increment', { cluster, account }],

    mutationFn: () => {
      return program.methods.increment().accounts({ counter: account }).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accountQuery.refetch();
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['counter', 'decrement', { cluster, account }],
    mutationFn: () => {
      return program.methods.decrement().accounts({ counter: account }).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accountQuery.refetch();
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],

    queryFn: () => program.account.counter.fetch(account),
  });

  return { incrementMutation, accountQuery, decrementMutation };
}
