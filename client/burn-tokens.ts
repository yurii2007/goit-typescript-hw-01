import 'dotenv/config';
import { burn, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';

const CONNECTION_URL = clusterApiUrl('devnet');
const TOKEN_DECIMALS = 2;
const BURN_AMOUNT = 5;
const TOKEN_MINT_ADDRESS = '3AZc1CwrWZxzMqKzxQCg9v34qGpSRkqJC1iN5o4DDSG1';

const connection = new Connection(CONNECTION_URL);
const user = getKeypairFromEnvironment('SECRET_KEY');
const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);

try {
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAccount,
    user.publicKey,
  );

  const burnAmount = BURN_AMOUNT * 10 ** TOKEN_DECIMALS;

  const burnSignature = await burn(
    connection,
    user,
    userTokenAccount.address,
    tokenMintAccount,
    user.publicKey,
    burnAmount,
  );

  const link = getExplorerLink('transaction', burnSignature, 'devnet');

  console.log('Burn transaction link:\n', link);
} catch (error) {
  console.error(error);
  process.exit(1);
}
