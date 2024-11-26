import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { getOrCreateAssociatedTokenAccount, revoke } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import 'dotenv/config';

const DEVNET_URL = clusterApiUrl('devnet');
const TOKEN_MINT_ADDRESS = '3AZc1CwrWZxzMqKzxQCg9v34qGpSRkqJC1iN5o4DDSG1';

const connection = new Connection(DEVNET_URL);
const user = getKeypairFromEnvironment('SECRET_KEY');

try {
  const tokenMintAddress = new PublicKey(TOKEN_MINT_ADDRESS);

  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAddress,
    user.publicKey,
  );

  const revokeSignature = await revoke(
    connection,
    user,
    userTokenAccount.address,
    user.publicKey,
  );

  const link = getExplorerLink('transaction', revokeSignature, 'devnet');

  console.log('Revoke transaction link:\n', link);
} catch (error) {
  console.error(error);
  process.exit(1);
}
