import * as borsh from '@coral-xyz/borsh';
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const equipPlayerSchema = borsh.struct([
  borsh.u8('variant'), // 8bit integer
  borsh.u16('playerId'), // 16bit integer
  borsh.u32('itemId'), // 32bit integer
]);

// allocate a new buffer which is bigger than needed space to slice it later for encoding data from schema
const buffer = Buffer.alloc(1000);
equipPlayerSchema.encode(
  { variant: 2, playerId: 1435, itemId: 531131 },
  buffer
);

const instructionBuffer = buffer.subarray(0, equipPlayerSchema.getSpan(buffer));

const endpoint = clusterApiUrl('devnet');
const connection = new Connection(endpoint);

const transaction = new Transaction();
const instruction = new TransactionInstruction({
  keys: [
    {
      pubkey: new PublicKey('player public key'),
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: new PublicKey('player info account key'),
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ],
  programId: new PublicKey('program public key'),
  data: instructionBuffer,
});

transaction.add(instruction);

try {
  const transactionId = await sendAndConfirmTransaction(
    connection,
    transaction,
    [new Keypair()] // player keypair
  );
  console.log(transactionId);
} catch (error) {
  console.log(error);
}
