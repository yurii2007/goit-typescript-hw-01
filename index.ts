import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));

const keyPair = new Keypair();

const instruction = new TransactionInstruction({
  programId: keyPair.publicKey,
  keys: [
    {
      pubkey: keyPair.publicKey,
      isSigner: true,
      isWritable: true,
    },
  ],
});

const transaction = new Transaction().add(instruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  keyPair,
]);

console.log(signature);
process.exit(0);
