import 'dotenv/config';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';

const AMOUNT = 0.1 * LAMPORTS_PER_SOL;

const connection = new Connection(clusterApiUrl('devnet'));

const payer = getKeypairFromEnvironment('SOLANA_KEY');

const receiverKey = process.argv[2] || null;

if (!receiverKey) {
  console.error('No receiver key provided');
  process.exit(1);
}

const receiver = new PublicKey(receiverKey);

const transaction = new Transaction();

// I have no idea what is the difference here(I should probably ask AI)
// const instruction = new TransactionInstruction({
//   keys: [
//     {
//       pubkey: receiver,
//       isSigner: true,
//       isWritable: false,
//     },
//   ],
//   programId: SystemProgram.programId,
// });
const instruction = SystemProgram.transfer({
  fromPubkey: payer.publicKey,
  toPubkey: receiver,
  lamports: AMOUNT,
  programId: SystemProgram.programId,
});

transaction.add(instruction);

const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer],
  {}
);

console.log(
  `You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
);
