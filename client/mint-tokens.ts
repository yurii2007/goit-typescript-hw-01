import { mintTo } from '@solana/spl-token';
import 'dotenv/config';
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
const connection = new Connection(clusterApiUrl('devnet'));

// 2 because of 2 decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const user = getKeypairFromEnvironment('SECRET_KEY');

const tokenMintAccount = new PublicKey(
  '6eMsMyNyQWLoJrSo2ytpdLC1f9TFjitqDVPkvh2WmkQi'
);

const recipient = new PublicKey('3AZc1CwrWZxzMqKzxQCg9v34qGpSRkqJC1iN5o4DDSG1');

const transactionSignature = await mintTo(
  connection,
  user,
  tokenMintAccount,
  recipient,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink('transaction', transactionSignature, 'devnet');

console.log(`✅ Success! Mint Token Transaction: ${link}`);
