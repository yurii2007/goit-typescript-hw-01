import 'dotenv/config';
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { approve, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';

const DEVNET_URL = clusterApiUrl('devnet');
const TOKEN_DECIMALS = 2;
const DELEGATE_AMOUNTS = 50;
const MINOR_UNITS_PER_MAJOR_UNITS = 10 ** TOKEN_DECIMALS;

const connection = new Connection(DEVNET_URL);
const user = getKeypairFromEnvironment('SECRET_KEY');

console.log(`Loaded keypair. Public key: ${user.publicKey.toBase58()}`);

const delegatePublicKey = new PublicKey(SystemProgram.programId);

const tokenMintAddress = new PublicKey(
  '3AZc1CwrWZxzMqKzxQCg9v34qGpSRkqJC1iN5o4DDSG1',
);

try {
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAddress,
    user.publicKey,
  );

  const approveTransactionSignature = await approve(
    connection,
    user,
    userTokenAccount.address,
    delegatePublicKey,
    user.publicKey,
    DELEGATE_AMOUNTS * MINOR_UNITS_PER_MAJOR_UNITS,
  );

  const link = getExplorerLink(
    'transaction',
    approveTransactionSignature,
    'devnet',
  );

  console.log('Approved transaction:\n', link);
} catch (error) {
  console.error(error);
  process.exit(1);
}
