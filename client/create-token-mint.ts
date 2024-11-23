import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';
import { createMint } from '@solana/spl-token';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import 'dotenv/config';

const connection = new Connection(clusterApiUrl('devnet'));

const user = getKeypairFromEnvironment('SECRET_KEY');

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

const res = await airdropIfRequired(connection, user.publicKey, 2, 1);
console.log(res);
// This is a shortcut that runs:
// SystemProgram.createAccount()
// token.createInitializeMintInstruction()
// See https://www.soldev.app/course/token-program
const tokenMint = await createMint(connection, user, user.publicKey, null, 2);

const link = getExplorerLink('address', tokenMint.toString(), 'devnet');

console.log(`✅ Finished! Created token mint: ${link}`);
