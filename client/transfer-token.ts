import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));

const user = getKeypairFromEnvironment('SECRET_KEY');

const recipient = new PublicKey('recipient key');

const tokenMintAccount = new PublicKey(
  '6eMsMyNyQWLoJrSo2ytpdLC1f9TFjitqDVPkvh2WmkQi'
);

const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  user.publicKey
);

const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient
);

const signature = await transfer(
  connection,
  user,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  user,
  1 * MINOR_UNITS_PER_MAJOR_UNITS
);

const explorerLink = getExplorerLink('transaction', signature, 'devnet');

console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}`);
