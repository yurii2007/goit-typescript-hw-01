import 'dotenv/config';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

const TRANSACTION_AMOUNT = 0.1 * LAMPORTS_PER_SOL;

const senderKeypair = getKeypairFromEnvironment('SOLANA_KEY');
const recipientKey = process.argv[2] || null;

if (!recipientKey) {
  console.error('Please provide a recipient key');
  process.exit(1);
}

const recipientAddress = new PublicKey(recipientKey);

const connection = new Connection(clusterApiUrl('devnet'));

const transaction = new Transaction();

const sendSOLInstruction = SystemProgram.transfer({
  fromPubkey: senderKeypair.publicKey,
  toPubkey: recipientAddress,
  lamports: TRANSACTION_AMOUNT,
});

transaction.add(sendSOLInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  senderKeypair,
]);

console.log(signature);

process.exit(0);
