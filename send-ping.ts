import 'dotenv/config';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { getKeypairFromEnvironment } from '@solana-developers/helpers';

const PING_PROGRAM_ADDRES = new PublicKey(
  'ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa'
);
const PING_PROGRAM_DATA_ADDRESS = new PublicKey(
  'Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod'
);

const payer = getKeypairFromEnvironment('SOLANA_KEY');
const connection = new Connection(clusterApiUrl('devnet'));

const transaction = new Transaction();
const programId = new PublicKey(PING_PROGRAM_ADDRES);
const pingProgramDataId = new PublicKey(PING_PROGRAM_DATA_ADDRESS);

const instruction = new TransactionInstruction({
  keys: [
    {
      pubkey: pingProgramDataId,
      isSigner: false,
      isWritable: true,
    },
  ],
  programId,
});

transaction.add(instruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  payer,
]);

console.log(
  `You can view your transaction on Solana Explorer at:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
);

process.exit(0);
